/* ═══════════════════════════════════════════════════════════════════
   Apenas melhoria progressiva.
   Tudo aqui é aditivo: se este arquivo não carregar, a página continua
   legível e navegável. Nada fica escondido por padrão — a classe `.js`
   adicionada no <head> é o que libera a animação de entrada.
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const prefereMenosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Ano do rodapé ─────────────────────────────────────────────── */
  const ano = document.getElementById('year');
  if (ano) ano.textContent = String(new Date().getFullYear());

  /* ── Revelação ao rolar ────────────────────────────────────────── */
  const alvos = document.querySelectorAll('.reveal');

  if (prefereMenosMovimento || !('IntersectionObserver' in window)) {
    // Sem suporte ao observer, ou o usuário pediu menos movimento: mostra tudo.
    alvos.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observador = new IntersectionObserver(
      (entradas, obs) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add('is-visible');
          obs.unobserve(entrada.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    alvos.forEach((el, i) => {
      // Escalonamento leve: irmãos entram em cascata em vez de todos juntos.
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 60}ms`;
      observador.observe(el);
    });
  }

  /* ── Menu mobile ───────────────────────────────────────────────── */
  const botaoMenu = document.querySelector('.nav-toggle');
  const menuMobile = document.getElementById('mobile-nav');

  if (botaoMenu && menuMobile) {
    const definirMenu = (aberto) => {
      botaoMenu.setAttribute('aria-expanded', String(aberto));
      menuMobile.dataset.open = String(aberto);
    };

    botaoMenu.addEventListener('click', () => {
      definirMenu(botaoMenu.getAttribute('aria-expanded') !== 'true');
    });

    // Fecha depois de escolher o destino.
    menuMobile.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => definirMenu(false));
    });

    document.addEventListener('keydown', (evento) => {
      if (evento.key !== 'Escape') return;
      if (botaoMenu.getAttribute('aria-expanded') !== 'true') return;
      definirMenu(false);
      botaoMenu.focus();
    });

    // Voltar pro layout desktop não pode deixar um painel aberto pendurado.
    window.matchMedia('(min-width: 861px)').addEventListener('change', (evento) => {
      if (evento.matches) definirMenu(false);
    });
  }

  /* ── Seção ativa no menu ───────────────────────────────────────── */
  const links = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  const secoes = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (secoes.length && 'IntersectionObserver' in window) {
    const marcarAtiva = (id) => {
      links.forEach((link) => {
        if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    };

    const observadorSecao = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visivel) marcarAtiva(visivel.target.id);
      },
      // Faixa no terço superior da tela: a seção que está sendo lida.
      { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.25, 0.5] }
    );

    secoes.forEach((secao) => observadorSecao.observe(secao));
  }

  /* ── Terminal digitando ────────────────────────────────────────── */
  /* Roda uma vez por sessão do navegador, só quando o terminal aparece
     na tela, e nunca quando o usuário pediu menos movimento. O texto já
     vem no HTML, então pular ou falhar não custa informação nenhuma.   */
  const terminal = document.getElementById('terminal');
  const botaoPular = document.getElementById('terminal-skip');

  const jaRodou = (() => {
    try {
      return sessionStorage.getItem('resumo-digitado') === '1';
    } catch {
      return false; // Modo anônimo / storage bloqueado: só roda.
    }
  })();

  const marcarRodado = () => {
    try {
      sessionStorage.setItem('resumo-digitado', '1');
    } catch {
      /* Sem storage — a animação simplesmente repete na próxima visita. */
    }
  };

  if (terminal && !prefereMenosMovimento && !jaRodou && 'IntersectionObserver' in window) {
    const valores = Array.from(terminal.querySelectorAll('.term-line__val'));
    const originais = valores.map((el) => el.textContent);
    let timer = null;
    let terminou = false;

    const finalizar = () => {
      if (terminou) return;
      terminou = true;
      if (timer) clearTimeout(timer);
      valores.forEach((el, i) => { el.textContent = originais[i]; });
      terminal.removeAttribute('aria-busy');
      if (botaoPular) botaoPular.hidden = true;
      marcarRodado();
    };

    const digitar = (linha, caractere) => {
      if (terminou) return;
      if (linha >= valores.length) return finalizar();

      const texto = originais[linha];
      valores[linha].textContent = texto.slice(0, caractere);

      if (caractere >= texto.length) {
        timer = setTimeout(() => digitar(linha + 1, 0), 90);
      } else {
        // Variação leve: lê como digitação, não como barra de progresso.
        timer = setTimeout(() => digitar(linha, caractere + 1), 9 + Math.random() * 14);
      }
    };

    const comecar = () => {
      // Esconde os estados intermediários de leitores de tela para o texto
      // não ser lido letra por letra.
      terminal.setAttribute('aria-busy', 'true');
      valores.forEach((el) => { el.textContent = ''; });
      if (botaoPular) {
        botaoPular.hidden = false;
        botaoPular.addEventListener('click', finalizar, { once: true });
      }
      digitar(0, 0);
    };

    const observadorTerminal = new IntersectionObserver(
      (entradas, obs) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          obs.disconnect();
          comecar();
        });
      },
      { threshold: 0.35 }
    );

    observadorTerminal.observe(terminal);

    // Sair da aba no meio da animação resolve ela na hora.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) finalizar();
    });
  } else if (botaoPular) {
    botaoPular.hidden = true;
  }
})();
