import { useState, useEffect, useRef } from "react"
import OrbitGallerySection from "./components/ui/demo"

// Gallery images array pointing to optimized web WebP images
const GALLERY_IMAGES = [
  "/images/galeria/web/_MG_1329.webp?v=2",
  "/images/galeria/web/_MG_1493.webp?v=2",
  "/images/galeria/web/_MG_3967-Edit.webp?v=2",
  "/images/galeria/web/_MG_6579.webp?v=2",
  "/images/galeria/web/Sem-Título-4.webp?v=2",
  "/images/galeria/web/_MG_8815.webp?v=2",
  "/images/galeria/web/_MG_9784.webp?v=2",
  "/images/galeria/web/IMG_20230319_232434_655.webp?v=2"
]

const GALLERY_ALTS = [
  "Retrato feminino em preto e branco, iluminação dramática",
  "Retrato feminino com olhar penetrante, fundo escuro",
  "Retrato masculino clássico, estilo editorial",
  "Retrato expressivo com iluminação lateral",
  "Família em perfil — pai, mãe e filho, preto e branco",
  "Retrato intimista em contraluz",
  "Retrato artístico com fundo escuro",
  "Retrato masculino artístico com luz quente"
]

function App() {
  // --- States ---
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [is3DInView, setIs3DInView] = useState(false)

  // --- Refs ---
  const touchStartX = useRef(0)
  const orbitRef = useRef<HTMLDivElement>(null)

  // --- Effects ---
  useEffect(() => {
    // 1. Scroll handlers (Navbar background & Active links)
    const handleScroll = () => {
      // Navbar background
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }

      // Active Section Tracking
      const sections = document.querySelectorAll("section[id], header[id]")
      const scrollY = window.scrollY + 120

      sections.forEach((section) => {
        const top = (section as HTMLElement).offsetTop
        const height = (section as HTMLElement).offsetHeight
        const id = section.getAttribute("id")

        if (id && scrollY >= top && scrollY < top + height) {
          setActiveSection(id)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    // 2. Scroll Reveal Observer
    const revealElements = document.querySelectorAll(".reveal")
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
            revealObserver.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -60px 0px",
      }
    )

    revealElements.forEach((el) => revealObserver.observe(el))

    // 3. 3D Gallery Intersection Observer
    const orbitSection = orbitRef.current
    const orbitObserver = new IntersectionObserver(
      ([entry]) => {
        setIs3DInView(entry.isIntersecting)
      },
      { rootMargin: "150px" }
    )

    if (orbitSection) {
      orbitObserver.observe(orbitSection)
    }

    return () => {
      window.removeEventListener("scroll", handleScroll)
      revealObserver.disconnect()
      if (orbitSection) {
        orbitObserver.unobserve(orbitSection)
      }
    }
  }, [])

  // 3. Keyboard Navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null)
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length : null))
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % GALLERY_IMAGES.length : null))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxIndex])

  // --- Helpers ---
  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false)
    document.body.style.overflow = ""
    const target = document.getElementById(sectionId)
    if (target) {
      target.scrollIntoView({ behavior: "smooth" })
    }
  }

  const toggleMobileMenu = () => {
    const nextState = !isMobileMenuOpen
    setIsMobileMenuOpen(nextState)
    document.body.style.overflow = nextState ? "hidden" : ""
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    document.body.style.overflow = "hidden"
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
    document.body.style.overflow = ""
  }

  const navigateLightbox = (direction: number) => {
    if (lightboxIndex === null) return
    setLightboxIndex((prev) => (prev !== null ? (prev + direction + GALLERY_IMAGES.length) % GALLERY_IMAGES.length : null))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].screenX
    const diff = touchStartX.current - touchEndX
    if (Math.abs(diff) > 50) {
      navigateLightbox(diff > 0 ? 1 : -1)
    }
  }

  return (
    <>
      {/* ======== NAVBAR ======== */}
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`} id="navbar">
        <div className="navbar__inner">
          <a href="#hero" className="navbar__logo-text" onClick={(e) => { e.preventDefault(); handleNavClick("hero"); }}>
            Retrato Almeida
          </a>

          <ul className={`navbar__links ${isMobileMenuOpen ? "open" : ""}`} id="navLinks">
            <li>
              <a 
                href="#galeria" 
                className={`navbar__link ${activeSection === "galeria" ? "active" : ""}`}
                onClick={(e) => { e.preventDefault(); handleNavClick("galeria"); }}
              >
                Galeria
              </a>
            </li>
            <li>
              <a 
                href="#sobre" 
                className={`navbar__link ${activeSection === "sobre" ? "active" : ""}`}
                onClick={(e) => { e.preventDefault(); handleNavClick("sobre"); }}
              >
                Sobre
              </a>
            </li>
            <li>
              <a 
                href="#processo" 
                className={`navbar__link ${activeSection === "processo" ? "active" : ""}`}
                onClick={(e) => { e.preventDefault(); handleNavClick("processo"); }}
              >
                Processo
              </a>
            </li>
            <li>
              <a 
                href="#contato" 
                className={`navbar__link ${activeSection === "contato" ? "active" : ""}`}
                onClick={(e) => { e.preventDefault(); handleNavClick("contato"); }}
              >
                Contato
              </a>
            </li>
            <li>
              <a 
                href="https://wa.me/5594991471792?text=Ol%C3%A1.%20Gostaria%20de%20conhecer%20os%20pacotes%20para%20sess%C3%B5es%20de%20retrato." 
                className="navbar__cta" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Agendar Sessão
              </a>
            </li>
          </ul>

          <button 
            className={`navbar__hamburger ${isMobileMenuOpen ? "active" : ""}`} 
            id="hamburger" 
            aria-label="Abrir menu"
            onClick={toggleMobileMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* ======== HERO ======== */}
      <section className="hero" id="hero">
        <div className="hero__bg">
          <img src="/images/capa/5024113740995473410_121.jpg?v=2" alt="Retrato artístico — Retrato Almeida" loading="eager" />
        </div>
        <div className="hero__overlay"></div>

        <div className="hero__content">


          <h1 className="hero__title">
            <span>Retrato Almeida</span>
          </h1>

          <div className="hero__divider"></div>

          <p className="hero__subtitle">Não o momento. O caráter.</p>

          <a 
            href="https://wa.me/5594991471792?text=Ol%C3%A1.%20Gostaria%20de%20conhecer%20os%20pacotes%20para%20sess%C3%B5es%20de%20retrato." 
            className="hero__cta" 
            target="_blank" 
            rel="noopener noreferrer" 
            id="heroCta"
          >
            Agendar Sessão
          </a>
        </div>

        <div className="hero__scroll-hint">
          <span>Descubra</span>
          <div className="hero__scroll-line"></div>
        </div>
      </section>

      {/* ======== FILOSOFIA ======== */}
      <section className="philosophy section" id="filosofia">
        <div className="container container--narrow">
          <div className="arabesque-divider reveal">
            <svg viewBox="0 0 280 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="16" x2="90" y2="16" stroke="#d4af37" strokeWidth="0.5"/>
              <line x1="190" y1="16" x2="280" y2="16" stroke="#d4af37" strokeWidth="0.5"/>
              <polygon points="140,4 152,16 140,28 128,16" fill="none" stroke="#d4af37" strokeWidth="0.8"/>
              <polygon points="140,8 148,16 140,24 132,16" fill="none" stroke="#d4af37" strokeWidth="0.5"/>
              <polygon points="105,12 111,16 105,20 99,16" fill="none" stroke="#d4af37" strokeWidth="0.5"/>
              <polygon points="175,12 181,16 175,20 169,16" fill="none" stroke="#d4af37" strokeWidth="0.5"/>
              <circle cx="93" cy="16" r="1.5" fill="#d4af37"/>
              <circle cx="187" cy="16" r="1.5" fill="#d4af37"/>
              <circle cx="117" cy="16" r="1" fill="#d4af37"/>
              <circle cx="163" cy="16" r="1" fill="#d4af37"/>
            </svg>
          </div>

          <blockquote className="philosophy__quote reveal">
            "Um retrato não captura o momento — ele <span>revela quem você é</span> quando ninguém está olhando."
          </blockquote>

          <p className="philosophy__attribution reveal reveal-delay-1">— Retrato Almeida</p>

          <div className="arabesque-divider reveal reveal-delay-2">
            <svg viewBox="0 0 280 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="16" x2="90" y2="16" stroke="#d4af37" strokeWidth="0.5"/>
              <line x1="190" y1="16" x2="280" y2="16" stroke="#d4af37" strokeWidth="0.5"/>
              <polygon points="140,4 152,16 140,28 128,16" fill="none" stroke="#d4af37" strokeWidth="0.8"/>
              <polygon points="140,8 148,16 140,24 132,16" fill="none" stroke="#d4af37" strokeWidth="0.5"/>
              <polygon points="105,12 111,16 105,20 99,16" fill="none" stroke="#d4af37" strokeWidth="0.5"/>
              <polygon points="175,12 181,16 175,20 169,16" fill="none" stroke="#d4af37" strokeWidth="0.5"/>
              <circle cx="93" cy="16" r="1.5" fill="#d4af37"/>
              <circle cx="187" cy="16" r="1.5" fill="#d4af37"/>
              <circle cx="117" cy="16" r="1" fill="#d4af37"/>
              <circle cx="163" cy="16" r="1" fill="#d4af37"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ======== EXPERIÊNCIA 3D IMERSIVA ======== */}
      <section className="orbit-experience" id="experiencia" ref={orbitRef}>
        <div className="orbit-experience__canvas">
          {is3DInView && <OrbitGallerySection />}
        </div>
        <div className="orbit-experience__overlay">
          <div className="orbit-experience__content reveal">
            <p className="section-label">Experiência Imersiva</p>
            <h2 className="section-title">Explore Nossos <em>Retratos</em></h2>
            <p className="orbit-experience__hint">
              Arraste para explorar a órbita
            </p>
          </div>
        </div>
      </section>

      {/* ======== GALERIA ======== */}
      <section className="gallery section" id="galeria">
        <div className="container">
          <p className="section-label reveal">Portfólio</p>
          <h2 className="section-title reveal">A <em>Galeria</em></h2>
        </div>

        <div className="gallery__grid">
          {GALLERY_IMAGES.map((src, index) => (
            <div 
              key={index} 
              className={`gallery__item reveal ${index === 1 ? "gallery__item--tall" : index === 4 ? "gallery__item--wide" : ""}`}
              onClick={() => openLightbox(index)}
              data-index={index}
            >
              <img src={src} alt={GALLERY_ALTS[index]} loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* ======== LIGHTBOX ======== */}
      <div 
        className={`lightbox ${lightboxIndex !== null ? "active" : ""}`} 
        id="lightbox" 
        role="dialog" 
        aria-label="Visualização de imagem"
        onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button className="lightbox__close" id="lightboxClose" aria-label="Fechar" onClick={closeLightbox}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
        </button>
        <button className="lightbox__nav lightbox__nav--prev" id="lightboxPrev" aria-label="Anterior" onClick={() => navigateLightbox(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button className="lightbox__nav lightbox__nav--next" id="lightboxNext" aria-label="Próxima" onClick={() => navigateLightbox(1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="9 6 15 12 9 18"/></svg>
        </button>
        {lightboxIndex !== null && (
          <>
            <img className="lightbox__image" id="lightboxImage" src={GALLERY_IMAGES[lightboxIndex]} alt={GALLERY_ALTS[lightboxIndex]} />
            <div className="lightbox__counter" id="lightboxCounter">
              {lightboxIndex + 1} / {GALLERY_IMAGES.length}
            </div>
          </>
        )}
      </div>

      {/* ======== SOBRE NÓS ======== */}
      <section className="about section" id="sobre">
        <div className="container">
          <p className="section-label reveal">Quem Somos</p>
          <h2 className="section-title reveal">Os <em>Artistas</em></h2>
        </div>

        <div className="about__grid">
          <div className="about__image-wrapper reveal">
            <img src="/images/galeria/minha-irma-e-eu.jpg?v=2" alt="Daniel e Aniny — Fundadores do Retrato Almeida" className="about__image" loading="lazy" />
          </div>

          <div className="about__content reveal reveal-delay-1">
            <p className="about__text">
              Somos <strong>Daniel</strong> e <strong>Aniny</strong>, fundadores de Marabá que transformaram obsessão por luz e sombra em vocação. 
              O <strong>Retrato Almeida</strong> nasceu de uma crença simples: cada rosto carrega uma história que merece ser vista — não como selfie efêmera, mas como obra permanente.
            </p>
            <p className="about__text">
              Nosso estúdio não é um cenário de festas. É um ateliê onde luz, silêncio e tempo conspiram para revelar o que você carrega por dentro. 
              Trabalhamos com iluminação clássica, fundos escuros e a paciência que um retrato verdadeiro exige.
            </p>
            <p className="about__text">
              <strong>Não fotografamos sorrisos ensaiados.</strong> Capturamos quem você é quando para de posar.
            </p>

            <div className="about__names">
              <div className="about__name">
                <img src="/images/galeria/eu.jpg?v=2" alt="Daniel Almeida" className="about__name-photo" loading="lazy" />
                <h4>Daniel</h4>
                <p>Fotógrafo & Diretor</p>
              </div>
              <div className="about__name">
                <img src="/images/galeria/minha-irma.jpg?v=2" alt="Aniny Almeida — Co-fundadora" className="about__name-photo" loading="lazy" />
                <h4>Aniny</h4>
                <p>Co-fundadora & Produção</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== PROCESSO ======== */}
      <section className="process section" id="processo">
        <div className="container">
          <p className="section-label reveal">Como Funciona</p>
          <h2 className="section-title reveal">O <em>Processo</em></h2>
        </div>

        <div className="process__grid">
          {/* Card 1 */}
          <div className="process__card reveal">
            <div className="process__number">01</div>
            <div className="process__icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 40h32M12 36V22M36 36V22M16 22V12h16v10M24 12V6"/>
                <circle cx="24" cy="30" r="4"/>
              </svg>
            </div>
            <h3 className="process__card-title">Conversa</h3>
            <p className="process__card-text">
              Tudo começa com um café e uma conversa. Queremos saber quem você é antes de ligar qualquer câmera.
            </p>
          </div>

          {/* Card 2 */}
          <div className="process__card reveal reveal-delay-1">
            <div className="process__number">02</div>
            <div className="process__icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="14" width="36" height="24" rx="2"/>
                <circle cx="24" cy="26" r="7"/>
                <circle cx="24" cy="26" r="3"/>
                <path d="M16 14l4-6h8l4 6"/>
              </svg>
            </div>
            <h3 className="process__card-title">Sessão</h3>
            <p className="process__card-text">
              No estúdio, com iluminação clássica e sem pressa. Sem poses forçadas — apenas presença e autenticidade.
            </p>
          </div>

          {/* Card 3 */}
          <div className="process__card reveal reveal-delay-2">
            <div className="process__number">03</div>
            <div className="process__icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="8" y="6" width="32" height="36" rx="2"/>
                <rect x="14" y="12" width="20" height="16" rx="1"/>
                <line x1="14" y1="34" x2="34" y2="34"/>
                <line x1="14" y1="38" x2="26" y2="38"/>
              </svg>
            </div>
            <h3 className="process__card-title">Revelação</h3>
            <p className="process__card-text">
              A curadoria final: selecionamos os retratos mais verdadeiros e os entregamos como obra — digital e, se desejar, impressa em fine art.
            </p>
          </div>
        </div>
      </section>

      {/* ======== CTA ======== */}
      <section className="cta-section section" id="contato">
        <div className="container">
          <div className="arabesque-divider reveal">
            <svg viewBox="0 0 280 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="16" x2="90" y2="16" stroke="#d4af37" strokeWidth="0.5"/>
              <line x1="190" y1="16" x2="280" y2="16" stroke="#d4af37" strokeWidth="0.5"/>
              <polygon points="140,4 152,16 140,28 128,16" fill="none" stroke="#d4af37" strokeWidth="0.8"/>
              <polygon points="140,8 148,16 140,24 132,16" fill="none" stroke="#d4af37" strokeWidth="0.5"/>
              <polygon points="105,12 111,16 105,20 99,16" fill="none" stroke="#d4af37" strokeWidth="0.5"/>
              <polygon points="175,12 181,16 175,20 169,16" fill="none" stroke="#d4af37" strokeWidth="0.5"/>
              <circle cx="93" cy="16" r="1.5" fill="#d4af37"/>
              <circle cx="187" cy="16" r="1.5" fill="#d4af37"/>
              <circle cx="117" cy="16" r="1" fill="#d4af37"/>
              <circle cx="163" cy="16" r="1" fill="#d4af37"/>
            </svg>
          </div>

          <h2 className="cta-section__title reveal">Pronto para ser <em>visto</em>?</h2>
          <p className="cta-section__subtitle reveal reveal-delay-1">Converse conosco e agende sua sessão de retrato.</p>

          <div className="cta-section__buttons reveal reveal-delay-2">
            <a 
              href="https://wa.me/5594991471792?text=Ol%C3%A1.%20Gostaria%20de%20conhecer%20os%20pacotes%20para%20sess%C3%B5es%20de%20retrato." 
              className="cta-btn cta-btn--primary" 
              target="_blank" 
              rel="noopener noreferrer" 
              id="ctaWhatsapp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <a href="mailto:contato@almeidaretrato.com" className="cta-btn cta-btn--outline" id="ctaEmail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>
              Email
            </a>
          </div>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer className="footer" id="footer">
        <div className="container">
          <div className="footer__inner">
            <a href="#hero" className="footer__logo-text" onClick={(e) => { e.preventDefault(); handleNavClick("hero"); }}>
              Retrato Almeida
            </a>

            <div className="footer__info">
              <p>Marabá, PA — Brasil</p>
              <p><a href="mailto:contato@almeidaretrato.com">contato@almeidaretrato.com</a></p>
            </div>

            <div className="footer__socials">
              <a href="https://wa.me/5594991471792" className="footer__social" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="mailto:contato@almeidaretrato.com" className="footer__social" aria-label="Email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>
              </a>
            </div>

            <p className="footer__copy">© 2025 Retrato Almeida. Todos os direitos reservados. Desenvolvido por <a href="https://nexoratecnologia.com" target="_blank" rel="noopener noreferrer">nexoratecnologia.com</a></p>
          </div>
        </div>
      </footer>
    </>
  )
}

export default App
