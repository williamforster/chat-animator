const shadowDiv = document.getElementById('shadow');
//shadowDiv.style.z-index = -1;
shadowDiv.style.background = 'rgba(0,0,0,0.1)';
shadowDiv.style.transform = 'skew(64deg, 0)';
shadowDiv.style.borderRadius = '50px';
shadowDiv.style.boxShadow = '-2px 1px 100px 16px rgba(0,0,0,0.1)';

const observer = new ResizeObserver(entries => {
  const entry = entries[0];
  console.log('contentRect', entry.contentRect);
  console.log(document.getElementById('wrapper').getClientRects());
    const wrapper = document.getElementById('wrapper');
  const rect = document.getElementById('wrapper').getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();
  // do other work here…
  shadowDiv.style.width = `${rect.width}px`;
  shadowDiv.style.height = `${rect.height}px`;
  shadowDiv.style.bottom = `80px`;
  shadowDiv.style.left = `${(bodyRect.width - rect.width) / 2}px`;
  shadowDiv.style.transform = `skew(64deg, 0)`;
  shadowDiv.style.transformOrigin = '50% 100%';
});


document.body.style.zIndex = '-2';
document.body.style.position = 'relative';

observer.observe(document.getElementById('wrapper'));
observer.observe(document.body);
