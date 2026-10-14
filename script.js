const COL = {
    black: "#161616",
    cream: "#f1ede4",
    rock: "#6b5545",
    grey: "#7a7a7a"
};

const NAMES = {
    black: "Černá",
    cream: "Krémová",
    rock: "Skála",
    grey: "Šedá"
};

const CL = ["S", "M", "L", "XL", "XXL"];

const P = [
    { n: "Core Tee", p: 699, g: "top", t: "tee", c: ["black", "cream", "rock"], s: CL },
    { n: "Sunset Hoodie", p: 1490, g: "top", t: "hood", c: ["black", "grey"], s: CL },
    { n: "Essential Tee", p: 699, g: "top", t: "tee", c: ["cream", "black", "rock"], s: CL },
    { n: "Sunset Cap", p: 599, g: "acc", t: "cap", c: ["black", "rock"], s: ["UNI"] },
    { n: "Tote Bag", p: 399, g: "acc", t: "tote", c: ["black", "cream"], s: ["UNI"] },
    { n: "Chill Shorts", p: 799, g: "bottom", t: "short", c: ["black", "grey"], s: ["S", "M", "L", "XL"] }
];

const SHAPES = {
    tee: '<path d="M30 20l20-8c4 8 16 8 20 0l20 8 12 24-16 8v46H34V52L18 44z"/>',
    hood: '<path d="M28 24l18-10c2 6 6 10 14 10s12-4 14-10l18 10 12 30-14 6v42H30V60L16 54z"/>',
    cap: '<path d="M20 70c0-30 20-44 40-44s40 14 40 44z"/><path d="M60 70h50c0 6-12 10-26 10H60z"/>',
    tote: '<path d="M32 44h56v68H32z"/><path d="M44 44V28c0-18 32-18 32 0v16" fill="none" stroke-width="5"/>',
    short: '<path d="M30 30h60l6 62H66L60 56l-6 36H24z"/>'
};

function art(t, col) {
    const dark = col === "black" || col === "rock" || col === "grey";
    
    let mark = "";
    if (t === "cap") {
        mark = '<circle cx="60" cy="52" r="6" fill="#ee9650"/>';
    } else if (t === "tote") {
        mark = '<rect x="50" y="70" width="20" height="3" fill="#ee9650"/><circle cx="60" cy="62" r="6" fill="#ee9650"/>';
    } else if (t === "short") {
        mark = '<circle cx="82" cy="82" r="3.5" fill="#ee9650"/>';
    } else {
        const cyCircle = t === "hood" ? 66 : 56;
        const yRect = t === "hood" ? 76 : 66;
        mark = `<circle cx="60" cy="${cyCircle}" r="8" fill="#ee9650"/><rect x="48" y="${yRect}" width="24" height="3" fill="#ee9650"/>`;
    }

    const strokeColor = dark ? "#333" : "#bdb6a6";
    
    return `
        <svg viewBox="0 0 120 130" fill="${COL[col]}" stroke="${strokeColor}" stroke-width="1.5" stroke-linejoin="round">
            ${SHAPES[t]}
            ${mark}
        </svg>
    `;
}

const grid = document.getElementById("grid");

P.forEach((x, i) => {
    x.col = x.c[0];
    x.size = x.s[0];
    
    const el = document.createElement("article");
    el.className = "card reveal";
    el.dataset.g = x.g;
    
    const dotsHTML = x.c.map((c, j) => {
        const activeClass = j === 0 ? " on" : "";
        return `<span class="dot${activeClass}" data-c="${c}" title="${NAMES[c]}" style="background:${COL[c]}"></span>`;
    }).join("");
    
    const sizesHTML = x.s.map((s, j) => {
        const activeClass = j === 0 ? "on" : "";
        return `<button class="${activeClass}">${s}</button>`;
    }).join("");

    el.innerHTML = `
        <div class="img">${art(x.t, x.col)}</div>
        <h3>${x.n}</h3>
        <div class="price">${x.p.toLocaleString("cs-CZ")} Kč</div>
        <div class="dots">${dotsHTML}</div>
        <div class="sizes">${sizesHTML}</div>
        <button class="add">Do košíku</button>
    `;
    
    el.addEventListener("click", e => {
        const d = e.target.closest(".dot");
        const s = e.target.closest(".sizes button");
        
        if (d) {
            x.col = d.dataset.c;
            el.querySelectorAll(".dot").forEach(o => o.classList.toggle("on", o === d));
            el.querySelector(".img").innerHTML = art(x.t, x.col);
        }
        
        if (s) {
            x.size = s.textContent;
            el.querySelectorAll(".sizes button").forEach(o => o.classList.toggle("on", o === s));
        }
        
        if (e.target.classList.contains("add")) {
            add(x);
        }
    });
    
    grid.appendChild(el);
});

document.getElementById("filters").addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    
    document.querySelectorAll("#filters button").forEach(o => o.classList.toggle("on", o === b));
    
    document.querySelectorAll(".card").forEach(c => {
        const shouldShow = b.dataset.f === "all" || c.dataset.g === b.dataset.f;
        c.style.display = shouldShow ? "" : "none";
    });
});

let cart = [];
const $ = id => document.getElementById(id);

function add(x) {
    cart.push({ n: x.n, p: x.p, col: NAMES[x.col], size: x.size });
    render();
    $("drawer").classList.add("open");
}

function render() {
    $("count").textContent = cart.length;
    
    if (cart.length) {
        $("items").innerHTML = cart.map((c, i) => `
            <div>
                <span>
                    ${c.n}
                    <small>${c.col} · ${c.size}</small>
                </span>
                <span>
                    ${c.p} Kč 
                    <button data-i="${i}" aria-label="Odebrat">✕</button>
                </span>
            </div>
        `).join("");
    } else {
        $("items").innerHTML = '<p style="color:var(--grey)">Košík je prázdný.</p>';
    }
    
    const totalPrice = cart.reduce((a, c) => a + c.p, 0);
    $("total").textContent = totalPrice.toLocaleString("cs-CZ") + " Kč";
}

$("items").addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b) {
        cart.splice(Number(b.dataset.i), 1);
        render();
    }
});

$("cartBtn").onclick = () => $("drawer").classList.add("open");
$("close").onclick = () => $("drawer").classList.remove("open");

$("checkout").onclick = () => {
    if (!cart.length) return;
    alert("Díky! Objednávka (demo) odeslána.");
    cart = [];
    render();
    $("drawer").classList.remove("open");
};

$("news").onsubmit = e => {
    e.preventDefault();
    e.target.innerHTML = "<span>Díky, vidíme se po západu slunce.</span>";
};

const io = new IntersectionObserver(es => {
    es.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
        }
    });
}, { threshold: .12 });

document.querySelectorAll(".reveal").forEach(el => io.observe(el));

render();