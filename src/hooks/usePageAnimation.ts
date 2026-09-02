import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function usePageAnimation(selector = ".gsap-animate", stagger = 0.1, yOffset = 30) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const elements = gsap.utils.toArray(selector);
            
            if (elements.length > 0) {
                gsap.fromTo(
                    elements,
                    { 
                        y: yOffset, 
                        opacity: 0 
                    },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.6,
                        stagger: stagger,
                        ease: "power3.out",
                        clearProps: "all"
                    }
                );
            }
        },
        { scope: containerRef }
    );

    return containerRef;
}
