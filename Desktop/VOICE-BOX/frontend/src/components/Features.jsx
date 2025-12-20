import React from "react";
import { Shield, BarChart3, Users } from "lucide-react";

export default function Features() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">

        {/* Block 1 */}
        <div className="glass rounded-xl p-8 text-center">
          <Shield className="w-12 h-12 mx-auto text-purple-400" />
          <h3 className="mt-4 text-xl font-semibold text-white">Zero Tracking</h3>
          <p className="mt-2 text-slate-400 text-sm">
            No cookies, no logs, no way to identify you.
          </p>
        </div>

        {/* Block 2 */}
        <div className="glass rounded-xl p-8 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-teal-300" />
          <h3 className="mt-4 text-xl font-semibold text-white">Real Impact</h3>
          <p className="mt-2 text-slate-400 text-sm">
            Top feedback gets reviewed by leadership.
          </p>
        </div>

        {/* Block 3 */}
        <div className="glass rounded-xl p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-blue-300" />
          <h3 className="mt-4 text-xl font-semibold text-white">Community Driven</h3>
          <p className="mt-2 text-slate-400 text-sm">
            Upvote ideas you believe in.
          </p>
        </div>

      </div>
    </section>
  );
}


