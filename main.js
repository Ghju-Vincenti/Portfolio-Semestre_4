const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.hero .cta').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const options = prefersReducedMotion ? {} : { behavior: 'smooth' };
    document.querySelector('#projects').scrollIntoView(options);
  });
});

const downloadBtn = document.querySelector('.cta-header');
if (downloadBtn) {
  downloadBtn.addEventListener('click', e => {
    e.preventDefault();
    if (prefersReducedMotion) {
      window.location.href = downloadBtn.href;
      return;
    }
    const shouldDownload = confirm('Do you want to download my CV?');
    if (shouldDownload) {
      window.location.href = downloadBtn.href;
    }
  });
}
