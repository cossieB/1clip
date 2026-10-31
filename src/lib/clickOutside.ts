export default function clickOutside(handler: (e: MouseEvent) => void) {
  return (el: Element) => {
    const onClick = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) handler(e);
    };

    document.body.addEventListener("click", onClick);
    return () => document.body.removeEventListener("click", onClick);
  };
}