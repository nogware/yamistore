document.addEventListener('DOMContentLoaded', () => {

  /* ===========================
     CONFIG
  ============================ */
  const WHATSAPP_NUMBER = "5491136204786"; // <- Cambiar por el número real

  /* ===========================
     MENÚ HAMBURGUESA
  ============================ */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('active'));
    });
  }

  /* ===========================
     ANIMACIONES AL SCROLL
  ============================ */
  const fadeElements = document.querySelectorAll('.fade-in');
  if (fadeElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    fadeElements.forEach(el => observer.observe(el));
  }

  /* ===========================
     SLIDER (AUTOMÁTICO + FLECHAS)
  ============================ */
  const slider = document.querySelector('.slider');
  const slides = document.querySelectorAll('.slide');
  const nextBtn = document.querySelector('.next');
  const prevBtn = document.querySelector('.prev');
  let currentIndex = 0;
  let autoSlideInterval = null;

  function showSlide(index) {
    if (!slider || slides.length === 0) return;
    if (index >= slides.length) currentIndex = 0;
    else if (index < 0) currentIndex = slides.length - 1;
    else currentIndex = index;
    slider.style.transform = `translateX(${-currentIndex * 100}%)`;
  }

  function startAutoSlide() {
    if (!slider || slides.length === 0) return;
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => showSlide(currentIndex + 1), 5000);
  }

  function resetAutoSlide() {
    startAutoSlide();
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { showSlide(currentIndex + 1); resetAutoSlide(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { showSlide(currentIndex - 1); resetAutoSlide(); });
  showSlide(0);
  startAutoSlide();

  /* ===========================
     CARRITO, MODAL Y WHATSAPP
  ============================ */
  const cartIcon = document.getElementById('cart-icon');
  const cartCountEl = document.getElementById('cart-count');
  const cartModal = document.getElementById('cart-modal');
  const closeCartBtn = document.getElementById('close-cart');
  const cartList = document.getElementById('cart-list');
  const btnWhatsappModal = document.getElementById('btn-whatsapp-modal');
  const btnWhatsappInline = document.getElementById('btn-whatsapp'); // opcional

  // Estado del carrito: { nombre, cantidad }
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarritoUI();
  }

  function getTotalItems() {
    return carrito.reduce((acc, it) => acc + (it.cantidad || 1), 0);
  }

  function actualizarCarritoUI() {
    if (cartCountEl) cartCountEl.textContent = getTotalItems();
    if (!cartList) return;
    cartList.innerHTML = '';

    if (carrito.length === 0) {
      const empty = document.createElement('li');
      empty.textContent = 'El carrito está vacío';
      cartList.appendChild(empty);
      return;
    }

    carrito.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML = `<strong>${item.nombre}</strong> &nbsp; x${item.cantidad || 1}`;

      const controls = document.createElement('div');
      controls.className = 'cart-item-controls';

      const btnDecrease = document.createElement('button');
      btnDecrease.textContent = '-';
      btnDecrease.addEventListener('click', () => {
        if ((item.cantidad || 1) > 1) {
          carrito[index].cantidad = (item.cantidad || 1) - 1;
        } else {
          carrito.splice(index, 1);
        }
        guardarCarrito();
      });

      const btnIncrease = document.createElement('button');
      btnIncrease.textContent = '+';
      btnIncrease.addEventListener('click', () => {
        carrito[index].cantidad = (item.cantidad || 1) + 1;
        guardarCarrito();
      });

      const btnRemove = document.createElement('button');
      btnRemove.textContent = 'Eliminar';
      btnRemove.addEventListener('click', () => {
        carrito.splice(index, 1);
        guardarCarrito();
      });

      controls.appendChild(btnDecrease);
      controls.appendChild(btnIncrease);
      controls.appendChild(btnRemove);
      li.appendChild(controls);
      cartList.appendChild(li);
    });
  }

  // Agregar producto
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      if (!card) return;
      const nombre = card.dataset.nombre || card.querySelector('h3')?.textContent || 'Producto';

      const idx = carrito.findIndex(it => it.nombre === nombre);
      if (idx > -1) {
        carrito[idx].cantidad = (carrito[idx].cantidad || 1) + 1;
      } else {
        carrito.push({ nombre, cantidad: 1 });
      }
      guardarCarrito();
      alert(`Producto agregado: ${nombre}`);
    });
  });

  // Abrir modal
  if (cartIcon && cartModal) {
    cartIcon.addEventListener('click', () => {
      actualizarCarritoUI();
      cartModal.style.display = 'block';
    });
  }

  // Cerrar modal
  if (closeCartBtn && cartModal) {
    closeCartBtn.addEventListener('click', () => cartModal.style.display = 'none');
  }
  window.addEventListener('click', (e) => {
    if (e.target === cartModal) cartModal.style.display = 'none';
  });

  // Enviar pedido por WhatsApp
  function enviarPedidoPorWhatsApp() {
    if (!carrito || carrito.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    let mensaje = "Hola, quiero hacer el siguiente pedido:%0A";
    carrito.forEach((item, i) => {
      mensaje += `${i + 1}. ${item.nombre} x${item.cantidad || 1}%0A`;
    });

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensaje}`;
    window.open(url, '_blank');
  }

  if (btnWhatsappModal) btnWhatsappModal.addEventListener('click', enviarPedidoPorWhatsApp);
  if (btnWhatsappInline) btnWhatsappInline.addEventListener('click', enviarPedidoPorWhatsApp);

  actualizarCarritoUI();
});

/* ===========================
   FILTRADO DE PRODUCTOS
============================ */
const filterButtons = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const category = btn.dataset.category;
    productCards.forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
});
