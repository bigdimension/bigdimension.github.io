(() => {
  const container = document.getElementById('protein-viewer');
  const status = document.getElementById('viewer-status');
  const viewerCard = document.querySelector('.viewer-card');

  if (!container || !status) return;

  if (!window.$3Dmol) {
    status.textContent = 'Não foi possível carregar o visualizador 3D. Verifica a ligação à internet e tenta novamente.';
    status.classList.add('error');
    return;
  }

  const viewer = $3Dmol.createViewer(container, {
    backgroundColor: '#ffffff',
    antialias: true,
  });

  let isInteracting = false;
  let resumeTimer;

  const startSpin = () => {
    viewer.spin('y', 0.45);
    viewerCard?.classList.remove('is-interacting');
  };

  const pauseSpin = () => {
    isInteracting = true;
    clearTimeout(resumeTimer);
    viewer.spin(false);
    viewerCard?.classList.add('is-interacting');
  };

  const resumeSpin = () => {
    if (!isInteracting) return;
    isInteracting = false;
    resumeTimer = window.setTimeout(startSpin, 500);
  };

  container.addEventListener('pointerdown', pauseSpin);
  window.addEventListener('pointerup', resumeSpin);
  window.addEventListener('pointercancel', resumeSpin);
  container.addEventListener('wheel', () => {
    pauseSpin();
    resumeTimer = window.setTimeout(resumeSpin, 900);
  }, { passive: true });

  $3Dmol.download('pdb:1M2Z', viewer, {}, (model) => {
    if (!model) {
      status.textContent = 'Não foi possível obter a estrutura 1M2Z do Protein Data Bank.';
      status.classList.add('error');
      return;
    }

    viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
    viewer.addSurface($3Dmol.SurfaceType.VDW, {
      opacity: 0.18,
      color: '#b8c9e6',
    });
    viewer.zoomTo();
    viewer.resize();
    viewer.render();
    status.remove();
    startSpin();
  });
})();
