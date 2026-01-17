import express from 'express';
import Circle from '../models/Circle.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new circle

router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { name, description, tags, visibility } = req.body;
        const userId = req.userid;

        // Create new circle
        const newCircle = await Circle.create({
            name,
            description,
            tags,
            visibility,
            admins: [userId],
            members: [userId],
            memberCount: 1
        });


        res.status(201).json({ success: true, circle: newCircle });

    }
    catch (error) {
        console.error("Circle Creation Error:", error);
        res.status(500).json({ message: "Error creating circle", error: error.message });

    }


}
)


router.get('/all', authMiddleware, async (req, res) => {

    try {
        const circles = await Circle.find().sort({ memberCount: -1 }).limit(10);
        res.status(200).json({ success: true, circles });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching circles" });
    }




}

)

router.post('/join/:id', authMiddleware, async (req, res) => {
    try {
        const circle = await Circle.findById(req.params.id);
        const userId = req.userid;

        if (!circle) return res.status(404).json({ message: "Circle not found" });

        // If already a member, just tell the frontend to navigate
        if (circle.members.includes(userId)) {
            return res.json({ success: true, status: 'joined', message: "Already a member" });
        }

        if (circle.visibility === 'public') {
            await Circle.findByIdAndUpdate(req.params.id, {
                $addToSet: { members: userId },
                $inc: { memberCount: 1 }
            });
            return res.json({ success: true, status: 'joined' });
        } else {
            const io = req.app.get('socketio');

            // Private: Add to requests array
            const updatedRequests = await Circle.findByIdAndUpdate(req.params.id, {
                $addToSet: { requests: userId }
            }, { new: true }).populate('requests', 'displayName avatarUrl');

            // Notify all admins about the new request via Socket.io
            updatedRequests.admins.forEach(adminId => {
                io.to(adminId.toString()).emit('new_join_request', {
                    circleId: req.params.id,
                    circleName: circle.name,
                    userId: userId,
                    userName: updatedRequests.requests.find(r => r._id.toString() === userId).displayName,
                    userAvatar: updatedRequests.requests.find(r => r._id.toString() === userId).avatarUrl

                })
            })



            return res.json({ success: true, status: 'requested' });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const circle = await Circle.findById(req.params.id)
            .populate('members', 'displayName avatarUrl')
            .populate('admins', 'displayName avatarUrl');

        if (!circle) {
            return res.status(404).json({ message: "Circle not found" });
        }

        // Single check: Since admins are members, we only need to check membership
        const isMember = circle.members.some(m => m._id.toString() === req.userid);

        if (circle.visibility === 'private' && !isMember) {
            return res.status(403).json({
                message: "Access denied. This is a private circle.",
                isPrivate: true
            });
        }

        res.json({ success: true, circle });
    } catch (error) {
        console.error("Error fetching circle:", error);
        res.status(500).json({ message: "Server error" });
    }
});



router.post('/:id/leave', authMiddleware, async (req, res) => {
    try {

        const circleId = req.params.id;
        const userId = req.userid;

        const circle = await Circle.findById(circleId);
        if (!circle) {
            return res.status(404).json({ message: "Circle not found" });
        }

        //if u are the only admin there , block leaving
        if (circle.admins.length === 1 && circle.admins.includes(userId)) {
            return res.status(400).json({
                message: "You are the only admin. Please appoint another admin or delete the circle."
            });
        }

        await Circle.findByIdAndUpdate(circleId, {
            $pull: { members: userId, admins: userId },
            $inc: { memberCount: -1 }
        });

        res.status(200).json({
            success: true,
            message: "You have left the circle."
        });

    }
    catch (error) {
        console.error("Error leaving circle:", error);
        res.status(500).json({ message: "Internal server error" });
    }





})




router.get('/admin/pending-requests', authMiddleware, async (req, res) => {

    try {
        const userId = req.userid;

        const circles = await Circle.find({ admins: userId }).populate('requests', 'displayName avatarUrl');

        const tasks = [];
        circles.forEach(circle => {
            circle.requests.forEach(userReq => {
                tasks.push({
                    circleId: circle._id,
                    circleName: circle.name,
                    userId: userReq._id,
                    userName: userReq.displayName,
                    userAvatar: userReq.avatarUrl
                });
            });
        });



        res.status(200).json({ requests: tasks });

    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }


}
)



router.post('/:circleId/request-action', authMiddleware, async (req, res) => {
    try {
        const { circleId } = req.params;
        const { targetUserId, status } = req.body;
        const adminId = req.userid;

        const circle = await Circle.findById(circleId);
        if (!circle) {
            return res.status(404).json({ message: "Circle not found" });
        }

        // Security Check: Is the person performing this action an admin?
        if (!circle.admins.includes(adminId)) {
            return res.status(403).json({ message: "Access denied. You are not an admin of this circle." });
        }


        if (status === 'approve') {
            // Move user from 'requests' to 'members'
            // We use $addToSet to prevent duplicate membership
            await Circle.findByIdAndUpdate(circleId, {
                $pull: { requests: targetUserId },
                $addToSet: { members: targetUserId },
                $inc: { memberCount: 1 }
            });

            // Optional: Create a notification for the user telling them they were accepted
            // await Notification.create({ recipient: targetUserId, text: `You have been accepted into ${circle.name}` ... });

        } else if (status === 'reject') {
            // Simply remove from the requests array
            await Circle.findByIdAndUpdate(circleId, {
                $pull: { requests: targetUserId }
            });
        }

        res.status(200).json({
            success: true,
            message: `User successfully ${status}ed.`
        });


    }
    catch (err) {
        console.error("Request action error:", err);
        res.status(500).json({ message: "Internal server error" });

    }

}
);



router.post('/:id/promote', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { targetUserId } = req.body;
        const requesterId = req.userid; // From your authMiddleware

        const circle = await Circle.findById(id);
        if (!circle) return res.status(404).json({ message: "Circle not found" });

        // 1. Check if the person making the request is an admin
        const isRequesterAdmin = circle.admins.some(admin => admin.toString() === requesterId);
        if (!isRequesterAdmin) {
            return res.status(403).json({ message: "Only admins can promote members" });
        }

        // 2. Add target user to the admins array (using $addToSet to avoid duplicates)
        await Circle.findByIdAndUpdate(id, {
            $addToSet: { admins: targetUserId }
        });

        res.json({ success: true, message: "Member promoted to admin" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});


router.post('/:id/remove-member', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { targetUserId } = req.body;
        const requesterId = req.userid;

        const circle = await Circle.findById(id);
        if (!circle) return res.status(404).json({ message: "Circle not found" });

        // 1. Verify requester is admin
        const isRequesterAdmin = circle.admins.some(admin => admin.toString() === requesterId);
        if (!isRequesterAdmin) {
            return res.status(403).json({ message: "Only admins can remove members" });
        }

        // 2. Prevent admins from removing themselves (they should use 'Leave')
        if (targetUserId === requesterId) {
            return res.status(400).json({ message: "You cannot remove yourself. Use 'Leave Circle' instead." });
        }

        // 3. Remove user from both members and admins arrays
        await Circle.findByIdAndUpdate(id, {
            $pull: {
                members: targetUserId,
                admins: targetUserId
            },
            $inc: { memberCount: -1 } // Decrement the member count
        });

        res.json({ success: true, message: "Member removed from circle" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

export default router;




