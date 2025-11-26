import { useState, useEffect } from "react";
interface CarouselProps {
images: string[];
autoPlay?: boolean; // Activa o desactiva autoplay
interval?: number; // Tiempo entre slides (ms)
pauseOnHover?: boolean; // Pausa cuando el ratón está encima
}
const Carousel: React.FC<CarouselProps> = ({
images,
autoPlay = true,
interval = 3000,
pauseOnHover = true,
}) => {
const [currentIndex, setCurrentIndex] = useState<number>(0);
const [isPaused, setIsPaused] = useState<boolean>(false);
const next = (): void =>
setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
const prev = (): void =>
setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
// Autoplay logic
useEffect(() => {
if (!autoPlay || isPaused) return;
const timer = setInterval(next, interval);
return () => clearInterval(timer);
}, [autoPlay, isPaused, interval, currentIndex]);
return (
<div
className="relative w-full max-w-3xl mx-auto overflow-hidden rounded-2xl shadowlg"
onMouseEnter={() => pauseOnHover && setIsPaused(true)}
onMouseLeave={() => pauseOnHover && setIsPaused(false)}
>
{/* Images */}
<div
className="flex transition-transform duration-700 ease-in-out"
style={{ transform: `translateX(-${currentIndex * 100}%)` }}
>
{images.map((src, i) => (
<img
key={i}
src={src}
className="w-full flex-shrink-0 object-cover h-64 sm:h-80 md:h-[400px] lg:h-
[500px] xl:h-[600px]"
alt={`Slide ${i + 1}`}
/>
))}
</div>
{/* Navigation buttons */}
<button
onClick={prev}
className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-gray-800/50
text-white p-2 rounded-full hover:bg-gray-800"
aria-label="Previous Slide"
>
❮
</button>
<button
onClick={next}
className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-gray-800/50
text-white p-2 rounded-full hover:bg-gray-800"
aria-label="Next Slide"
>
❯
</button>
{/* Indicators */}
<div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
{images.map((_, i) => (
<button
key={i}
onClick={() => setCurrentIndex(i)}
className={`w-3 h-3 rounded-full transition-colors duration-300 ${
i === currentIndex ? "bg-white" : "bg-gray-400"
}`}
aria-label={`Go to slide ${i + 1}`}
/>
))}
</div>
</div>
);
};
export default Carousel;