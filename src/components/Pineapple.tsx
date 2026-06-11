/* eslint-disable @next/next/no-img-element */
export function Pineapple({ className = "h-6 w-6" }: { className?: string }) {
  // Official Paloneo / Minah brand mark — orange line-art pineapple.
  return (
    <img
      src="/paloneo-pineapple.png"
      alt="Paloneo"
      draggable={false}
      className={`${className} select-none object-contain`}
    />
  );
}
