/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav__menu'),
    navToggle = document.getElementById('nav__toggle'),
    navClose = document.getElementById('nav__close')

const setMenuState = (isOpen) => {
    if (!navMenu || !navToggle) return

    const isMobile = window.innerWidth < 768

    navMenu.classList.toggle('show-menu', isOpen)
    navMenu.setAttribute('aria-hidden', String(isMobile && !isOpen))
    navToggle.setAttribute('aria-expanded', String(isOpen))
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu')
    document.body.classList.toggle('menu-open', isMobile && isOpen)
}

if (navMenu && navToggle) {
    navToggle.addEventListener('click', () => {
        setMenuState(!navMenu.classList.contains('show-menu'))
    })

    navClose?.addEventListener('click', () => setMenuState(false))

    document.addEventListener('click', (event) => {
        if (navMenu.classList.contains('show-menu') &&
            !navMenu.contains(event.target) && !navToggle.contains(event.target)) {
            setMenuState(false)
        }
    })

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navMenu.classList.contains('show-menu')) {
            setMenuState(false)
            navToggle.focus()
        }
    })

    window.addEventListener('resize', () => setMenuState(false))

    setMenuState(false)
}

/*=============== REMOVE MENU MOBILE ===============*/

const navlink = document.querySelectorAll('.nav__link'),
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

const linkAction = () => {
    /* when we click on each nav__link, we remove the show-menu class */
    setMenuState(false)
}
navlink.forEach(n => n.addEventListener('click', linkAction))

/*=============== SMOOTH SECTION NAVIGATION ===============*/
navlink.forEach(link => {
    link.addEventListener('click', (event) => {
        const section = document.querySelector(link.getAttribute('href'))

        if (!section) return

        event.preventDefault()
        section.scrollIntoView({
            behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
            block: 'start',
        })
        history.pushState(null, '', link.getAttribute('href'))
    })
})

/*=============== HOME TYPED JS ===============*/
const typedTarget = document.getElementById('home-typed')

if (typedTarget && typeof Typed !== 'undefined' && !prefersReducedMotion.matches) {
    new Typed('#home-typed', {
        strings: ['Software Engineer', 'Full Stack Developer'],
        typeSpeed: 80,
        backSpeed: 50,
        backDelay: 2000,
        loop: true,
        cursorChar: '_',
    })
} else if (typedTarget) {
    typedTarget.textContent = 'Software Engineer'
}
/*=============== ADD SHADOW HEADER ===============*/
const shadowHeader = () => {
    const header = document.getElementById('header')
    window.scrollY >= 50 ? header.classList.add('shadow-header')
                         : header.classList.remove('shadow-header')
}

window.addEventListener('scroll', shadowHeader, { passive: true })
shadowHeader()

/*=============== CONTACT EMAIL JS ===============*/
const contactForm = document.getElementById('contact-form'),
    contactStatus = document.getElementById('contact-status')

if (contactForm && contactStatus) {
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault()

        if (!contactForm.checkValidity()) {
            contactForm.reportValidity()
            return
        }

        const submitButton = contactForm.querySelector('.contact__button'),
            buttonText = contactForm.querySelector('.contact__button-text'),
            formData = Object.fromEntries(new FormData(contactForm).entries())

        submitButton.disabled = true
        submitButton.setAttribute('aria-busy', 'true')
        buttonText.textContent = 'Sending...'
        contactStatus.className = 'contact__status'
        contactStatus.textContent = 'Sending your message...'

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            const result = await response.json()
            const submissionSucceeded = result.success === true || result.success === 'true'

            if (!response.ok || !submissionSucceeded) {
                throw new Error(result.message || 'The message could not be sent.')
            }

            contactStatus.classList.add('contact__status--success')
            contactStatus.textContent = 'Your message was sent successfully. Thank you!'
            contactForm.reset()
        } catch (error) {
            console.error('Contact form submission failed:', error)
            contactStatus.classList.add('contact__status--error')
            contactStatus.textContent = 'The message could not be sent. Please try again in a moment.'
        } finally {
            submitButton.disabled = false
            submitButton.removeAttribute('aria-busy')
            buttonText.textContent = 'Send Message'
        }
    })
}


/*=============== SHOW SCROLL UP ===============*/


/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = [...document.querySelectorAll('main section[id]')]
let sectionOffsets = []
let activeLinkFrame

const measureSections = () => {
    sectionOffsets = sections.map(section => ({
        id: section.id,
        top: section.offsetTop,
    }))
}

const setActiveLink = () => {
    const marker = window.scrollY + window.innerHeight * .35
    let activeSection = sectionOffsets[0]?.id

    sectionOffsets.forEach(section => {
        if (marker >= section.top) activeSection = section.id
    })

    navlink.forEach(link => {
        const isActive = link.getAttribute('href') === `#${activeSection}`
        link.classList.toggle('nav__link--active', isActive)

        if (isActive) {
            link.setAttribute('aria-current', 'page')
        } else {
            link.removeAttribute('aria-current')
        }
    })

    activeLinkFrame = undefined
}

const requestActiveLinkUpdate = () => {
    if (activeLinkFrame) return
    activeLinkFrame = requestAnimationFrame(setActiveLink)
}

measureSections()
setActiveLink()
window.addEventListener('scroll', requestActiveLinkUpdate, { passive: true })
window.addEventListener('resize', () => {
    measureSections()
    requestActiveLinkUpdate()
})
window.addEventListener('load', () => {
    measureSections()
    setActiveLink()
})


/*=============== SCROLL REVEAL ANIMATION ===============*/
const revealItems = []

const prepareReveal = (selector, direction = '', stagger = 0, baseDelay = 0) => {
    document.querySelectorAll(selector).forEach((element, index) => {
        const revealDelay = baseDelay + stagger * index
        element.classList.add('reveal-on-scroll')
        if (direction) element.classList.add(direction)
        element.dataset.revealDelay = revealDelay
        element.style.setProperty('--reveal-delay', `${revealDelay}ms`)
        revealItems.push(element)
    })
}

const showRevealItem = (element) => {
    const delay = Number(element.dataset.revealDelay) || 0
    element.classList.add('is-visible')

    window.setTimeout(() => {
        element.classList.remove('reveal-on-scroll', 'reveal-from-left', 'reveal-from-right', 'is-visible')
        element.style.removeProperty('--reveal-delay')
        delete element.dataset.revealDelay
    }, 650 + delay)
}

if (!prefersReducedMotion.matches) {
    prepareReveal('.home__content', 'reveal-from-left', 0, 80)
    prepareReveal('.home__data', '', 0, 150)
    prepareReveal('.about__content', 'reveal-from-left')
    prepareReveal('.about__skills', 'reveal-from-right')
    prepareReveal('.additional-skills__header')
    prepareReveal('.additional-skill')
    prepareReveal('.projects__header')
    prepareReveal('.project__card', '', 90)
    prepareReveal('.project-experience__header')
    prepareReveal('.experience-project', '', 90)
    prepareReveal('.contact__header')
    prepareReveal('.contact__info', 'reveal-from-left')
    prepareReveal('.contact__form', 'reveal-from-right')

    const initialItems = revealItems.filter(element => element.closest('#home'))
    const scrollItems = revealItems.filter(element => !element.closest('#home'))

    requestAnimationFrame(() => {
        requestAnimationFrame(() => initialItems.forEach(showRevealItem))
    })

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return
                showRevealItem(entry.target)
                observer.unobserve(entry.target)
            })
        }, {
            threshold: .12,
            rootMargin: '0px 0px -8% 0px',
        })

        scrollItems.forEach(element => revealObserver.observe(element))
    } else {
        scrollItems.forEach(showRevealItem)
    }
}
