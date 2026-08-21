import type {
    ReactNode,
} from "react";

interface PageHeaderProps {
    title: string;

    description?: string;

    eyebrow?: string;

    action?: ReactNode;
}

export default function PageHeader({
                                       title,
                                       description,
                                       eyebrow,
                                       action,
                                   }: PageHeaderProps) {
    return (
        <header
            className="
        mb-6
        flex
        flex-col
        gap-4
        sm:flex-row
        sm:items-start
        sm:justify-between
      "
        >
            <div className="min-w-0">
                {eyebrow && (
                    <p
                        className="
              mb-2
              text-xs
              font-black
              uppercase
              tracking-[0.18em]
              text-fit-primary
            "
                    >
                        {eyebrow}
                    </p>
                )}

                <h1
                    className="
            text-2xl
            font-black
            tracking-tight
            text-slate-950
            sm:text-3xl
          "
                >
                    {title}
                </h1>

                {description && (
                    <p
                        className="
              mt-2
              max-w-3xl
              text-sm
              leading-6
              text-slate-500
              sm:text-base
            "
                    >
                        {description}
                    </p>
                )}
            </div>

            {action && (
                <div className="shrink-0">
                    {action}
                </div>
            )}
        </header>
    );
}