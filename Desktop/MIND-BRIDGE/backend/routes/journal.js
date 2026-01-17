import express from 'express';
import Journal from '../models/Journal.js';
import { authMiddleware } from '../middleware/authMiddleware.js';


const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.userid
        const journals = await Journal.find({ userId: userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            journals
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching journals" });
    }

}
)



router.post('/', authMiddleware, async (req, res) => {

    try {
        const { title, content, visibility } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: "Please add a title and content" });
        }

        const journal = await Journal.create({
            userId: req.userid,
            title,
            content,
            visibility
        });

        res.status(201).json({
            success: true,
            journal
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error saving journal" });
    }


}
)


router.delete('/:id', authMiddleware, async (req, res) => {

    try {
        const journal = await Journal.findById(req.params.id);

        if (!journal) {
            return res.status(404).json({ message: "Journal not found" });
        }


        if (journal.userId.toString() !== req.userid.toString()) {
            return res.status(401).json({ message: "User not authorized" });
        }

        await journal.deleteOne();
        res.status(200).json({ success: true, message: "Entry removed" });
    } catch (error) {
        res.status(500).json({ message: "Server error during deletion" });
    }


}
)


router.get('/recent', authMiddleware, async (req, res) => {

    try {
        try {

            const userId = req.userid;


            const journals = await Journal.find({ userId })
                .sort({ createdAt: -1 })
                .limit(3);

            res.status(200).json({ journals });
        } catch (error) {
            console.error("Error fetching recent journals:", error);
            res.status(500).json({ message: "Server Error" });
        }



    }
    catch (error) {


    }

}
)

export default router;