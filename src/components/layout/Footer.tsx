import {
    Dumbbell,
} from "lucide-react";

export default function Footer() {
    return (
        <footer
            className="
        mt-auto
        border-t
        border-slate-200/70
        px-6
        py-5
      "
        >
            <div
                className="
          mx-auto
          flex
          max-w-[1600px]
          items-center
          justify-center
          gap-2
          text-xs
          font-medium
          text-slate-400
        "
            >
                <Dumbbell className="h-4 w-4" />

                <span>
          ©{" "}
                    {new Date().getFullYear()}{" "}
                    <strong className="font-black uppercase tracking-wide text-slate-700">
            FitLife
          </strong>

                    {" "}— No Pain No Gain.
        </span>
            </div>
        </footer>
    );
}