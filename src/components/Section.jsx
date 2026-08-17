/**
 * Section shell: vertical rhythm, page gutter and the scroll-spy anchor.
 *
 * Deliberately renders no transform wrapper — a transformed ancestor becomes
 * the containing block for `position: sticky`, which would break the Projects
 * stack. Entrance animation belongs to the content, via <Reveal>/<Stagger>.
 *
 * The anchor offset comes from `html { scroll-padding-top }` — adding scroll-mt
 * here as well would double it.
 */
export default function Section({ children, id, className = '', bare = false }) {
    return (
        <section id={id} className={`relative w-full py-section ${className}`}>
            {bare ? children : <div className="container-page">{children}</div>}
        </section>
    );
}
