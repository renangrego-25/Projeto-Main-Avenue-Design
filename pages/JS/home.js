const btn = document.getElementById('hamburger');
const menu = document.getElementById('menu');

btn.addEventListener('click', () => {
    btn.classList.toggle('ativo');
    menu.classList.toggle('aberto')
}) 

menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('ativo');
      menu.classList.remove('aberto');
    });
});

const nav = document.getElementById("nav")

window.addEventListener("scroll", () => {
  if (window.scrollY >= 150){
    nav.classList.add("ativa");
  } else {
    nav.classList.remove("ativa");
  }
});

