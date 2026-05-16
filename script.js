(() => {
  let layoutSide = "right";
  let isPromoTextVisible = true;
  let renderer;
  let scene;
  let camera;
  let controls;
  let cameraRig;
  let deviceArm;
  let bobContainer;
  let spinContainer;
  let phoneGroup;
  let bodyMat;
  let btnMat;
  let baseScreen;
  let notch;
  let punchHoleGroup;
  let deviceMode = "mobile";
  let currentDeviceStyle = "iphone";
  let deviceParts = [];
  let scrollTextures = [];
  let manualDeviceScale = 1;
  let floorMat;
  let ambientLight;
  let spotLight;
  let fillLight;
  let rimLight;
  let underglowLight;
  let particles;
  let currentVideos = [];
  let mediaPlanes = [];
  let currentActiveIndex = 0;
  let carouselTimer = null;
  let isCarouselPlaying = false;
  let carouselLayout = "horizontal";
  let cinematicTL = null;
  let isCinematicRunning = false;
  let isAutoMixRunning = false;
  let mixThemeIndex = -1;
  let autoMixTimer = null;
  let isSliding = false;
  let mediaRecorder;
  let recordedChunks = [];
  let isRecording = false;
  let initialized = false;
  let currentProjectIndex = 0;
  let currentProjectMedia = [];
  let isPreviewMode = false;
  let isDevicePreviewOpen = false;
  let isDragMode = false;
  let devicePreviewSnapshot = null;
  let previewHelpEl = null;
  let raycaster;
  let pointer;
  let autoCinematicStep = 0;
  let screenTransitioning = false;
  let activeProjectGroup = "mobile";
  let activeContentType = "ui";
  let mediaLoadToken = 0;
  let lastCompactShowcaseControls = null;
  let showcaseHintTimer = null;

  const phoneState = { targetY: 0.25 };
  const selectedThemes = [4, 8, 9, 2];
  const allowedLayouts = ["horizontal", "coverflow", "fan", "curve"];
  const autoLayouts = ["coverflow", "fan", "curve", "horizontal"];
  const autoCameras = ["mix", "orbit", "dolly"];
  const autoTextAnimations = ["slide", "blur", "pop", "flip"];
  const showcaseGroups = [
    { id: "mobile", label: "Mobile", deviceMode: "mobile", allowVideo: true },
    { id: "web", label: "Web", deviceMode: "web", allowVideo: false },
    { id: "uiux", label: "UI/UX", deviceMode: "mobile", allowVideo: false },
  ];
  const pW = 1.45;
  const pH = 3.0;
  const pD = 0.15;
  const pR = 0.22;
  const deviceProfiles = {
    mobile: {
      width: pW,
      height: pH,
      depth: pD,
      radius: pR,
      screenWidth: pW - 0.12,
      screenHeight: pH - 0.12,
      screenRadius: pR - 0.04,
      screenZOffset: 0.021,
      baseScale: 1,
      mobileScale: 0.82,
      carouselBoost: 0,
    },
    web: {
      width: 4.35,
      height: 2.58,
      depth: 0.14,
      radius: 0.09,
      screenWidth: 4.08,
      screenHeight: 2.3,
      screenRadius: 0.055,
      screenZOffset: 0.022,
      baseScale: 0.72,
      mobileScale: 0.42,
      carouselBoost: 0.8,
    },
  };
  const themeGroups = {};
  const themeSettings = {
    2: { bg: 0x041f33, floor: 0x021626, ambInt: 1.0, spotInt: 1.5, spotColor: 0xe0f2fe, fillInt: 0.8, fillColor: 0x38bdf8, rimInt: 2.5, rimColor: 0x7dd3fc, floorRough: 0.1, floorMetal: 0.7, fogDensity: 0.005, underglow: 1.5 },
    4: { bg: 0x050811, floor: 0x080c14, ambInt: 0.4, spotInt: 2.0, spotColor: 0xe0f2fe, fillInt: 0.8, fillColor: 0x1e3a8a, rimInt: 3.5, rimColor: 0x38bdf8, floorRough: 0.1, floorMetal: 0.8, fogDensity: 0.008, underglow: 2.0 },
    8: { bg: 0x0a0500, floor: 0x080400, ambInt: 0.3, spotInt: 1.8, spotColor: 0xffedd5, fillInt: 0.6, fillColor: 0xc2410c, rimInt: 4.5, rimColor: 0xf97316, floorRough: 0.15, floorMetal: 0.6, fogDensity: 0.008, underglow: 3.0 },
    9: { bg: 0x050011, floor: 0x0a051a, ambInt: 0.6, spotInt: 1.5, spotColor: 0xccffff, fillInt: 1.0, fillColor: 0xc026d3, rimInt: 4.0, rimColor: 0x22d3ee, floorRough: 0.2, floorMetal: 0.5, fogDensity: 0.008, underglow: 1.5 },
  };

  function normalizeProjectTitle(title) {
    return String(title || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");
  }

  const portfolioProjectLookup = new Map((globalThis.portfolioProjectsData || []).map((project) => [normalizeProjectTitle(project.title), project]));

  function applyPortfolioProjectCopy(project) {
    const portfolioProject = portfolioProjectLookup.get(normalizeProjectTitle(project.title));
    if (!portfolioProject) return project;

    return {
      ...project,
      category: portfolioProject.category || project.category,
      tech: Array.isArray(portfolioProject.techs) && portfolioProject.techs.length ? portfolioProject.techs.join(", ") : project.tech,
      description: project.description,
    };
  }

  // Edit daftar ini untuk mengganti gambar/video 3D tanpa upload dari UI.
  const cinematicProjects = [
    {
      title: "ABROOF",
      showcaseGroup: "mobile",
      headline: "Showcase Proyek 3D",
      category: "MOBILE",
      tech: "Flutter, Dart, Hive",
      description: "Aplikasi manajemen stok, transaksi, dan keuangan berbasis offline-first untuk UMKM.",
      media: [
        { src: "images/ui/abroofui.webp" },
        { src: "images/ui/abroofui1.webp" },
        { src: "images/ui/abroofui2.webp" },
        { src: "images/ui/abroofui3.webp" },
        { src: "images/ui/abroofui4.webp" },
        { src: "images/ui/abroofui5.webp" },
        { src: "images/ui/abroofui6.webp" },
        { src: "images/ui/abroofui7.webp" },
        { src: "images/ui/abroofui8.webp" },
        { src: "images/ui/abroofui9.webp" },
      ],
      videoMedia: [{ type: "video-placeholder", label: "ABROOF Video" }],
    },
    {
      title: "MyRT14",
      showcaseGroup: "mobile",
      headline: "Showcase Proyek 3D",
      category: "MOBILE",
      tech: "Flutter, Dart, Hive",
      description: "Aplikasi manajemen data RT14 , pengelolaan data warga, kas dan iuran.",
      media: [{ src: "images/ui/myrt14ui.webp" }, { src: "images/ui/myrt14ui1.webp" }, { src: "images/ui/myrt14ui2.webp" }, { src: "images/ui/myrt14ui3.webp" }, { src: "images/ui/myrt14ui4.webp" }, { src: "images/ui/myrt14ui5.webp" }],
    },
    {
      title: "TokoKu",
      showcaseGroup: "uiux",
      headline: "Showcase Proyek 3D",
      category: "PRODUCT DESIGN",
      tech: "Flutter, Dart, Hive, Figma",
      description: "Aplikasi POS offline dengan alur transaksi cepat dan UI minimalis untuk pemilik UMKM.",
      media: [
        { src: "images/ui/tokoku (1).webp" },
        { src: "images/ui/tokoku (2).webp" },
        { src: "images/ui/tokoku (3).webp" },
        { src: "images/ui/tokoku (4).webp" },
        { src: "images/ui/tokoku (5).webp" },
        { src: "images/ui/tokoku (6).webp" },
        { src: "images/ui/tokoku (7).webp" },
        { src: "images/ui/tokoku (8).webp" },
        { src: "images/ui/tokoku (9).webp" },
        { src: "images/ui/tokoku (10).webp" },
        { src: "images/ui/tokoku (11).webp" },
        { src: "images/ui/tokoku (12).webp" },
        { src: "images/ui/tokoku (13).webp" },
        { src: "images/ui/tokoku (14).webp" },
        { src: "images/ui/tokoku (15).webp" },
        { src: "images/ui/tokoku (16).webp" },
        { src: "images/ui/tokoku (17).webp" },
        { src: "images/ui/tokoku (18).webp" },
      ],
    },
    {
      title: "Shoesavior",
      showcaseGroup: "mobile",
      headline: "Showcase Proyek 3D",
      category: "MOBILE",
      tech: "Flutter, Firebase, Maps",
      description: "Aplikasi manajemen jasa cuci sepatu untuk tracking order, status pengerjaan, dan transaksi.",
      media: [{ src: "images/ui/shoesavior.webp" }, { src: "images/ui/shoesavior1.webp" }, { src: "images/ui/shoesavior2.webp" }, { src: "images/ui/shoesavior3.webp" }],
      videoMedia: [{ type: "video-placeholder", label: "Shoesavior Video" }],
    },
    {
      title: "GikuRental",
      showcaseGroup: "uiux",
      headline: "Showcase Proyek 3D",
      category: "UI/UX",
      tech: "Figma, Prototype",
      description: "Desain landing page rental mobil yang fokus pada hierarki visual, alur booking, dan konversi.",
      media: [
        { src: "images/ui/giku.webp" },
        { src: "images/ui/giku1.webp" },
        { src: "images/ui/giku2.webp" },
        { src: "images/ui/giku3.webp" },
        { src: "images/ui/giku4.webp" },
        { src: "images/ui/giku5.webp" },
        { src: "images/ui/giku6.webp" },
        { src: "images/ui/giku7.webp" },
        { src: "images/ui/giku8.webp" },
        { src: "images/ui/giku9.webp" },
      ],
    },
    {
      title: "Makanan Nusantara",
      showcaseGroup: "web",
      headline: "Showcase Proyek 3D",
      category: "WEB",
      tech: "React, Tailwind, Chart.js",
      description: "Website eksplorasi kuliner Nusantara dengan katalog makanan daerah, rekomendasi, dan tampilan visual interaktif.",
      media: [
        { src: "images/ui/makananui.webp" },
        { src: "images/ui/makananui1.webp" },
        { src: "images/ui/makananui2.webp" },
        { src: "images/ui/makananui3.webp" },
        { src: "images/ui/makananui4.webp" },
        { src: "images/ui/makananui5.webp" },
        { src: "images/ui/makananui6.webp" },
      ],
    },
    {
      title: "InventoryPRO",
      showcaseGroup: "web",
      headline: "Showcase Proyek 3D",
      category: "WEB",
      tech: "React, Tailwind, Chart.js",
      description: "Dashboard inventaris web untuk memantau stok, data barang, dan ringkasan operasional.",
      media: [
        { src: "images/ui/inventoryPro.webp" },
        { src: "images/ui/inventoryPro1.webp" },
        { src: "images/ui/inventoryPro2.webp" },
        { src: "images/ui/inventoryPro3.webp" },
        { src: "images/ui/inventoryPro4.webp" },
        { src: "images/ui/inventoryPro5.webp" },
        { src: "images/ui/inventoryPro6.webp" },
        { src: "images/ui/inventoryPro7.webp" },
      ],
    },
    {
      title: "GK Rent Car",
      showcaseGroup: "web",
      headline: "Showcase Proyek 3D",
      category: "WEB",
      tech: "React, Tailwind, Responsive UI",
      description: "Website rental mobil dengan katalog armada, informasi layanan, dan CTA booking cepat.",
      media: [{ src: "images/ui/rent.webp" }, { src: "images/ui/gk.webp" }, { src: "images/ui/gk rent car.webp" }],
    },
  ].map(applyPortfolioProjectCopy);

  function qs(id) {
    return document.getElementById(id);
  }

  function getSize() {
    const container = qs("canvas-container");
    return {
      width: container?.clientWidth || window.innerWidth,
      height: container?.clientHeight || window.innerHeight,
    };
  }

  function switchTab(tabId, btnElement) {
    document.querySelectorAll(".tab-content").forEach((el) => el.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach((el) => el.classList.remove("active"));
    qs(tabId).classList.add("active");
    btnElement.classList.add("active");
  }

  function updateActiveButtonClass(groupId, activeBtnId, customClass = "btn-active") {
    document.querySelectorAll(`.${groupId}`).forEach((btn) => {
      btn.classList.remove(customClass);
      if (groupId === "cam-group" && !customClass.includes("fuchsia")) {
        btn.classList.replace("bg-gray-800", "bg-transparent");
        btn.classList.remove("border", "border-gray-600", "shadow-sm", "text-white");
        btn.classList.add("text-gray-300");
      }
    });
    const activeBtn = qs(activeBtnId);
    if (!activeBtn) return;
    activeBtn.classList.add(customClass);
    if (groupId === "cam-group") {
      activeBtn.classList.replace("bg-transparent", "bg-gray-800");
      activeBtn.classList.add("border", "border-gray-600", "shadow-sm", "text-white");
      activeBtn.classList.remove("text-gray-300");
    }
  }

  function togglePromoText() {
    isPromoTextVisible = !isPromoTextVisible;
    const overlay = qs("promoOverlay");
    const btn = qs("promoVisBtn");
    if (!overlay) return;
    if (isPromoTextVisible) {
      overlay.style.opacity = "1";
      overlay.style.pointerEvents = "none";
      if (btn) {
        btn.innerText = "ON";
        btn.classList.replace("bg-gray-600", "bg-yellow-600");
      }
      if (qs("autoTextAnim")?.checked) playTextAnimation();
    } else {
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
      if (btn) {
        btn.innerText = "OFF";
        btn.classList.replace("bg-yellow-600", "bg-gray-600");
      }
    }
  }

  function toggleLayoutSide() {
    const overlay = qs("promoOverlay");
    const content = qs("promoContent");
    const badgeBox = qs("badgeContainer");
    content.style.opacity = "0";
    setTimeout(() => {
      if (layoutSide === "right") {
        layoutSide = "left";
        overlay.classList.replace("justify-start", "justify-end");
        overlay.classList.replace("bg-gradient-to-r", "bg-gradient-to-l");
        content.classList.replace("text-left", "text-right");
        badgeBox.classList.replace("justify-start", "justify-end");
      } else {
        layoutSide = "right";
        overlay.classList.replace("justify-end", "justify-start");
        overlay.classList.replace("bg-gradient-to-l", "bg-gradient-to-r");
        content.classList.replace("text-right", "text-left");
        badgeBox.classList.replace("justify-end", "justify-start");
      }
      const origin = layoutSide === "right" ? "left center" : "right center";
      gsap.set("#promoContent", { transformOrigin: origin });
      updateCameraFraming();
      content.style.opacity = "1";
      if (qs("autoTextAnim").checked) playTextAnimation();
    }, 300);
  }

  function updateTextScale(val) {
    const origin = layoutSide === "right" ? "left center" : "right center";
    gsap.to("#promoContent", { scale: val, transformOrigin: origin, duration: 0.3, ease: "power2.out" });
  }

  function playTextAnimation(type) {
    if (!isPromoTextVisible || !window.gsap) return;
    type = type || qs("textAnimStyle")?.value || "slide";
    const textElements = ["#promoHeadline", "#promoSubline", "#promoDesc", "#badgeContainer"];
    gsap.killTweensOf(textElements);
    if (getSize().width < 768) {
      gsap.set(textElements, { opacity: 1, y: 0, scale: 1, rotationX: 0, filter: "none" });
      return;
    }
    if (type === "slide") {
      gsap.fromTo(textElements, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out", clearProps: "filter,scale,rotationX" });
    } else if (type === "pop") {
      gsap.fromTo(textElements, { scale: 0.8, opacity: 0, y: 0 }, { scale: 1, opacity: 1, duration: 0.7, stagger: 0.1, ease: "back.out(1.5)", clearProps: "filter,y,rotationX" });
    } else if (type === "blur") {
      gsap.fromTo(textElements, { filter: "blur(15px)", opacity: 0, scale: 1.05, y: 0 }, { filter: "blur(0px)", opacity: 1, scale: 1, duration: 0.9, stagger: 0.15, ease: "power2.out", clearProps: "y,rotationX" });
    } else if (type === "flip") {
      gsap.set("#promoContent", { perspective: 800 });
      gsap.fromTo(textElements, { rotationX: 90, opacity: 0, y: 20 }, { rotationX: 0, opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: "back.out(1.2)", clearProps: "filter,scale" });
    }
  }

  function updateCameraFraming() {
    if (!camera) return;
    const { width, height } = getSize();
    if (width < 768) {
      camera.clearViewOffset();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      return;
    }
    if (layoutSide === "right") camera.setViewOffset(width, height, -width * 0.22, 0, width, height);
    else if (layoutSide === "left") camera.setViewOffset(width, height, width * 0.22, 0, width, height);
    else camera.clearViewOffset();
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function createRoundedRectShape(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    s.moveTo(x, y + r);
    s.lineTo(x, y + h - r);
    s.quadraticCurveTo(x, y + h, x + r, y + h);
    s.lineTo(x + w - r, y + h);
    s.quadraticCurveTo(x + w, y + h, x + w, y + h - r);
    s.lineTo(x + w, y + r);
    s.quadraticCurveTo(x + w, y, x + w - r, y);
    s.lineTo(x + r, y);
    s.quadraticCurveTo(x, y, x, y + r);
    return s;
  }

  function getDeviceProfile() {
    return deviceProfiles[deviceMode] || deviceProfiles.mobile;
  }

  function getScreenZ(profile = getDeviceProfile()) {
    return profile.depth / 2 + profile.screenZOffset;
  }

  function createMappedScreenGeometry(w, h, r) {
    const screenGeo = new THREE.ShapeGeometry(createRoundedRectShape(w, h, r));
    const pos = screenGeo.attributes.position;
    const bBox = new THREE.Box3().setFromBufferAttribute(pos);
    const size = new THREE.Vector3();
    bBox.getSize(size);
    const uvs = [];
    for (let i = 0; i < pos.count; i++) {
      uvs.push((pos.getX(i) - bBox.min.x) / size.x, (pos.getY(i) - bBox.min.y) / size.y);
    }
    screenGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    return screenGeo;
  }

  function trackDevicePart(part) {
    deviceParts.push(part);
    phoneGroup.add(part);
    return part;
  }

  function disposeObjectTree(object) {
    object.traverse?.((node) => {
      node.geometry?.dispose?.();
      const materialList = Array.isArray(node.material) ? node.material : [node.material].filter(Boolean);
      materialList.forEach((mat) => {
        ["map", "emissiveMap", "roughnessMap", "metalnessMap", "normalMap"].forEach((key) => mat[key]?.dispose?.());
        mat.dispose?.();
      });
    });
  }

  function clearDeviceParts() {
    deviceParts.forEach((part) => {
      phoneGroup.remove(part);
      disposeObjectTree(part);
    });
    deviceParts = [];
    baseScreen = null;
    notch = null;
    punchHoleGroup = null;
  }

  function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
    const words = String(text || "").split(/\s+/);
    let line = "";
    let lines = 0;
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && line) {
        ctx.fillText(line, x, y);
        y += lineHeight;
        lines += 1;
        line = word;
        if (lines >= maxLines - 1) break;
      } else {
        line = next;
      }
    }
    if (line && lines < maxLines) ctx.fillText(line, x, y);
  }

  function createDefaultPromoTexture(project = cinematicProjects[0]) {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1900;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 900, 1900);
    gradient.addColorStop(0, "#0b1220");
    gradient.addColorStop(0.5, "#111827");
    gradient.addColorStop(1, "#030712");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 900, 1900);
    ctx.fillStyle = "#10b981";
    ctx.fillRect(110, 170, 680, 70);
    ctx.fillStyle = "rgba(16,185,129,0.16)";
    ctx.beginPath();
    ctx.arc(700, 520, 280, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 104px Inter, Arial, sans-serif";
    drawWrappedText(ctx, project.title, 110, 400, 680, 112, 2);
    ctx.font = "700 42px Inter, Arial, sans-serif";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(project.category || "PORTFOLIO", 110, 610);
    ctx.font = "500 38px Inter, Arial, sans-serif";
    ctx.fillStyle = "#9ca3af";
    drawWrappedText(ctx, project.description, 110, 710, 680, 56, 4);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i % 2 === 0 ? "rgba(16,185,129,0.22)" : "rgba(59,130,246,0.18)";
      ctx.fillRect(110, 1020 + i * 135, 680, 82);
    }
    ctx.font = "700 36px Inter, Arial, sans-serif";
    ctx.fillStyle = "#d1fae5";
    drawWrappedText(ctx, project.tech || "Three.js Showcase", 110, 1660, 680, 48, 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding || texture.encoding;
    return texture;
  }

  function createVideoPlaceholderTexture(project = cinematicProjects[0]) {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1600;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 900, 1600);
    gradient.addColorStop(0, "#020617");
    gradient.addColorStop(0.55, "#0f172a");
    gradient.addColorStop(1, "#020617");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 900, 1600);

    ctx.fillStyle = "rgba(0,210,122,0.16)";
    ctx.beginPath();
    ctx.arc(450, 560, 245, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#00d27a";
    ctx.beginPath();
    ctx.arc(450, 560, 112, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#06120d";
    ctx.beginPath();
    ctx.moveTo(425, 500);
    ctx.lineTo(425, 620);
    ctx.lineTo(530, 560);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 82px Inter, Arial, sans-serif";
    drawWrappedText(ctx, project.title, 100, 830, 700, 92, 2);
    ctx.font = "700 42px Inter, Arial, sans-serif";
    ctx.fillStyle = "#d1fae5";
    ctx.fillText("Video Konten", 100, 1020);
    ctx.font = "500 34px Inter, Arial, sans-serif";
    ctx.fillStyle = "#94a3b8";
    drawWrappedText(ctx, "Tambahkan file video ke folder videos lalu isi videoMedia di script.js.", 100, 1110, 700, 50, 4);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    setTextureColorSpace(texture);
    return texture;
  }

  function addThemeGeometry() {
    const backdropGeo = new THREE.CylinderGeometry(25, 25, 30, 64, 1, true, -Math.PI / 2 - 1.2, Math.PI + 2.4);
    [2, 4, 8, 9].forEach((idx) => {
      themeGroups[idx] = new THREE.Group();
      scene.add(themeGroups[idx]);
      themeGroups[idx].visible = idx === 4;
    });

    const t4Bg = new THREE.Mesh(backdropGeo, new THREE.MeshStandardMaterial({ color: 0x03050a, side: THREE.BackSide, roughness: 0.9 }));
    t4Bg.position.set(0, 5, -5);
    themeGroups[4].add(t4Bg);
    const t4Pillar = new THREE.Mesh(new THREE.BoxGeometry(3, 20, 1), new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.8, clearcoat: 1.0 }));
    t4Pillar.position.set(-6, 5, -8);
    t4Pillar.rotation.y = 0.5;
    themeGroups[4].add(t4Pillar);
    const t4Pillar2 = new THREE.Mesh(new THREE.BoxGeometry(2, 15, 1), new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.7 }));
    t4Pillar2.position.set(5, 5, -6);
    t4Pillar2.rotation.y = -0.3;
    themeGroups[4].add(t4Pillar2);
    const t4Podium = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.4, 64), new THREE.MeshPhysicalMaterial({ color: 0x0a0f1c, roughness: 0.1, metalness: 0.8, clearcoat: 1.0 }));
    t4Podium.position.y = -1.55;
    themeGroups[4].add(t4Podium);
    const t4GlowRing = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.03, 32, 100), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    t4GlowRing.rotation.x = Math.PI / 2;
    t4GlowRing.position.y = -1.35;
    themeGroups[4].add(t4GlowRing);

    const t8Bg = new THREE.Mesh(backdropGeo, new THREE.MeshStandardMaterial({ color: 0x050200, side: THREE.BackSide, roughness: 1.0 }));
    t8Bg.position.set(0, 5, -5);
    themeGroups[8].add(t8Bg);
    const t8Sun = new THREE.Mesh(new THREE.SphereGeometry(6, 64, 64), new THREE.MeshBasicMaterial({ color: 0xff3300 }));
    t8Sun.position.set(0, 2, -15);
    themeGroups[8].add(t8Sun);
    const t8Podium = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.5, 64), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.9, metalness: 0.1 }));
    t8Podium.position.y = -1.6;
    themeGroups[8].add(t8Podium);

    const t9Bg = new THREE.Mesh(backdropGeo, new THREE.MeshStandardMaterial({ color: 0x020008, side: THREE.BackSide, roughness: 1.0 }));
    t9Bg.position.set(0, 5, -5);
    themeGroups[9].add(t9Bg);
    const t9Podium = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.3, 4.5), new THREE.MeshPhysicalMaterial({ color: 0x0a0a12, roughness: 0.2, metalness: 0.7, clearcoat: 0.5 }));
    t9Podium.position.y = -1.5;
    themeGroups[9].add(t9Podium);
    const t9Portal = new THREE.Mesh(new THREE.TorusGeometry(6, 0.08, 32, 100), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
    t9Portal.position.set(0, 3, -12);
    themeGroups[9].add(t9Portal);
    const t9Portal2 = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.04, 32, 100), new THREE.MeshBasicMaterial({ color: 0xff00ff }));
    t9Portal2.position.set(0, 3, -12.5);
    themeGroups[9].add(t9Portal2);
    const t9Grid = new THREE.GridHelper(40, 40, 0xff00ff, 0x111133);
    t9Grid.position.y = -1.35;
    themeGroups[9].add(t9Grid);

    const t2Backdrop = new THREE.Mesh(backdropGeo, new THREE.MeshStandardMaterial({ color: 0x082f49, side: THREE.BackSide, roughness: 0.8 }));
    t2Backdrop.position.set(0, 5, -5);
    themeGroups[2].add(t2Backdrop);
    const t2NeonMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const t2Neon1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 25, 16), t2NeonMat);
    t2Neon1.position.set(-5, 6, -10);
    themeGroups[2].add(t2Neon1);
    const t2Neon2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 25, 16), t2NeonMat);
    t2Neon2.position.set(5, 6, -10);
    themeGroups[2].add(t2Neon2);
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0.95, ior: 1.5, clearcoat: 1.0 });
    const t2GlassCube = new THREE.Mesh(new THREE.BoxGeometry(2.5, 6, 2.5), glassMat);
    t2GlassCube.position.set(-6, 0.5, -6);
    t2GlassCube.rotation.y = 0.5;
    themeGroups[2].add(t2GlassCube);
    const t2GlassPillar = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 5, 32), glassMat);
    t2GlassPillar.position.set(6, -0.5, -5);
    themeGroups[2].add(t2GlassPillar);
    const t2PodiumBase = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 0.3, 64), new THREE.MeshStandardMaterial({ color: 0x021626, roughness: 0.2, metalness: 0.5 }));
    t2PodiumBase.position.y = -2.0;
    themeGroups[2].add(t2PodiumBase);
    const t2PodiumTop = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 0.5, 64), glassMat);
    t2PodiumTop.position.y = -1.6;
    themeGroups[2].add(t2PodiumTop);
  }

  function createBaseScreen(profile) {
    const defaultScreenTexture = createDefaultPromoTexture();
    const screenGeo = createMappedScreenGeometry(profile.screenWidth, profile.screenHeight, profile.screenRadius);
    baseScreen = new THREE.Mesh(
      screenGeo,
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: defaultScreenTexture,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    );
    baseScreen.position.z = getScreenZ(profile);
    trackDevicePart(baseScreen);
  }

  function buildMobileDevice(profile) {
    const bodyGeo = new THREE.ExtrudeGeometry(createRoundedRectShape(profile.width, profile.height, profile.radius), { depth: profile.depth, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 });
    bodyGeo.center();
    bodyMat = new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.2, metalness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    trackDevicePart(body);

    createBaseScreen(profile);

    notch = new THREE.Mesh(new THREE.ShapeGeometry(createRoundedRectShape(0.45, 0.12, 0.06)), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    notch.position.set(0, profile.height / 2 - 0.14, getScreenZ(profile) + 0.002);
    trackDevicePart(notch);

    punchHoleGroup = new THREE.Group();
    punchHoleGroup.add(new THREE.Mesh(new THREE.CircleGeometry(0.045, 32), new THREE.MeshBasicMaterial({ color: 0x000000 })));
    punchHoleGroup.position.set(0, profile.height / 2 - 0.16, getScreenZ(profile) + 0.002);
    punchHoleGroup.visible = false;
    trackDevicePart(punchHoleGroup);

    btnMat = new THREE.MeshStandardMaterial({ color: 0x18181a, metalness: 0.8, roughness: 0.3 });
    const powerBtn = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.4, 0.04), btnMat);
    powerBtn.position.set(profile.width / 2 + 0.01, 0.3, 0);
    trackDevicePart(powerBtn);

    setDeviceStyle(currentDeviceStyle);
  }

  function buildWebDevice(profile) {
    const lidGeo = new THREE.ExtrudeGeometry(createRoundedRectShape(profile.width, profile.height, profile.radius), { depth: profile.depth, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.025, bevelThickness: 0.018 });
    lidGeo.center();
    bodyMat = new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.18, metalness: 0.75 });
    const lid = new THREE.Mesh(lidGeo, bodyMat);
    lid.castShadow = true;
    trackDevicePart(lid);

    createBaseScreen(profile);

    const bezel = new THREE.Mesh(new THREE.ShapeGeometry(createRoundedRectShape(0.5, 0.045, 0.02)), new THREE.MeshBasicMaterial({ color: 0x050607 }));
    bezel.position.set(0, -profile.height / 2 + 0.08, getScreenZ(profile) + 0.002);
    trackDevicePart(bezel);

    btnMat = new THREE.MeshStandardMaterial({ color: 0x191a1d, metalness: 0.7, roughness: 0.28 });
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, profile.width * 0.82, 24), btnMat);
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(0, -profile.height / 2 - 0.04, 0.02);
    trackDevicePart(hinge);

    const base = new THREE.Mesh(new THREE.BoxGeometry(profile.width + 0.58, 0.08, 1.55), btnMat);
    base.position.set(0, -profile.height / 2 - 0.22, 0.55);
    base.rotation.x = -0.08;
    base.castShadow = true;
    base.receiveShadow = true;
    trackDevicePart(base);

    const trackpad = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.012, 0.42), new THREE.MeshStandardMaterial({ color: 0x0d0e11, metalness: 0.4, roughness: 0.45 }));
    trackpad.position.set(0, -profile.height / 2 - 0.17, 1.0);
    trackpad.rotation.x = -0.08;
    trackDevicePart(trackpad);

    notch = { visible: false };
    punchHoleGroup = { visible: false };
  }

  function buildDeviceModel() {
    if (!phoneGroup) return;
    clearDeviceParts();
    const profile = getDeviceProfile();

    if (deviceMode === "web") buildWebDevice(profile);
    else buildMobileDevice(profile);

    phoneGroup.rotation.x = deviceMode === "web" ? -0.02 : -0.05;
    phoneGroup.rotation.z = deviceMode === "web" ? -0.01 : -0.02;
    applyDeviceScale(0);
    updateDeviceModeButtons();
  }

  function initCinematic3D() {
    const container = qs("canvas-container");
    if (!container || !window.THREE || !window.gsap || !THREE.OrbitControls || initialized) return;
    initialized = true;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c10);
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.008);
    const { width, height } = getSize();
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    camera.position.set(0, 1.5, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 25;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    updateCameraFraming();

    ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    floorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.8 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -3;
    floor.receiveShadow = true;
    scene.add(floor);

    deviceArm = new THREE.Group();
    scene.add(deviceArm);
    cameraRig = new THREE.Group();
    deviceArm.add(cameraRig);
    bobContainer = new THREE.Group();
    deviceArm.add(bobContainer);
    spinContainer = new THREE.Group();
    bobContainer.add(spinContainer);
    phoneGroup = new THREE.Group();
    spinContainer.add(phoneGroup);
    phoneGroup.rotation.x = -0.05;
    phoneGroup.rotation.z = -0.02;

    spotLight = new THREE.SpotLight(0xffffff, 1.5);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.8;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.bias = -0.0001;
    spotLight.position.set(0, 12, 8);
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight, spotLight.target);
    fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-6, 4, 6);
    scene.add(fillLight);
    rimLight = new THREE.SpotLight(0xffffff, 2.0);
    rimLight.angle = Math.PI / 4;
    rimLight.penumbra = 0.5;
    rimLight.position.set(5, 6, -6);
    rimLight.target.position.set(0, 0, 0);
    scene.add(rimLight, rimLight.target);
    underglowLight = new THREE.PointLight(0xff6600, 0, 10);
    underglowLight.position.set(0, -1.2, 0);
    scene.add(underglowLight);

    addThemeGeometry();

    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(300 * 3);
    for (let i = 0; i < 900; i++) particlePos[i] = (Math.random() - 0.5) * 30;
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    particles = new THREE.Points(particleGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(particles);

    buildDeviceModel();

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    renderer.domElement.addEventListener("pointerdown", handlePreviewPointer);

    removeDisabledLayoutButtons();
    applyShowcaseUiClarity();
    renderProjectMediaControls();
    updateLiveCinematicButton();
    updatePreviewModeButton();
    updateDragModeButton();
    updateShowcaseModeHint("Sinematik aktif: kamera, tema, dan layout berubah otomatis.");
    installShowcaseHintObserver();
    window.addEventListener("resize", resizeCinematic);
    document.addEventListener("pointerdown", (event) => {
      if (!isDevicePreviewOpen || event.target === renderer.domElement) return;
      exitDevicePreview();
    });

    document.addEventListener("keydown", (e) => {
      if (e.code === "Escape") {
        if (isDevicePreviewOpen) {
          exitDevicePreview();
          return;
        }
      }
    });

    applyThemeVisuals(4);
    setManualMode();
    resizeCinematic();
    loadProjectMedia(0);
    setTimeout(() => playTextAnimation("slide"), 500);
    animateCinematic();
  }

  function resizeCinematic() {
    if (!renderer || !camera) return;
    const { width, height } = getSize();
    renderer.setSize(width, height);
    updateCameraFraming();
    applyDeviceScale(0);
    const compactControls = width < 768;
    if (lastCompactShowcaseControls !== null && lastCompactShowcaseControls !== compactControls) {
      renderProjectMediaControls();
    }
    lastCompactShowcaseControls = compactControls;
  }

  function getResponsiveDeviceScale() {
    const profile = getDeviceProfile();
    const responsiveBase = getSize().width < 768 ? profile.mobileScale : profile.baseScale;
    return responsiveBase * manualDeviceScale;
  }

  function applyDeviceScale(duration = 0.35) {
    if (!phoneGroup) return;
    const profile = getDeviceProfile();
    const targetScale = getResponsiveDeviceScale();
    const yOffset = (profile.height / 2) * (targetScale - profile.baseScale) * 0.22;

    if (!duration || !window.gsap) {
      phoneGroup.scale.setScalar(targetScale);
      phoneGroup.position.y = yOffset;
      return;
    }

    gsap.to(phoneGroup.scale, { x: targetScale, y: targetScale, z: targetScale, duration, ease: "back.out(1.2)" });
    gsap.to(phoneGroup.position, { y: yOffset, duration, ease: "back.out(1.2)" });
  }

  function updateDeviceScale(val) {
    manualDeviceScale = Number(val) || 1;
    applyDeviceScale(0.4);
  }

  function applyThemeVisuals(index) {
    const t = themeSettings[index];
    if (!t || !scene) return;
    document.querySelectorAll('[id^="themeBtn"]').forEach((btn) => {
      btn.classList.remove("border-blue-500", "border-orange-500", "border-cyan-500", "border-sky-400");
      btn.classList.add("border-transparent");
    });
    const activeBtn = qs("themeBtn" + index);
    if (activeBtn) {
      activeBtn.classList.remove("border-transparent");
      if (index === 4) activeBtn.classList.add("border-blue-500");
      if (index === 8) activeBtn.classList.add("border-orange-500");
      if (index === 9) activeBtn.classList.add("border-cyan-500");
      if (index === 2) activeBtn.classList.add("border-sky-400");
    }
    if (isCinematicRunning && !isAutoMixRunning) setManualMode();
    isSliding = true;
    setTimeout(() => (isSliding = false), 2000);
    if (qs("autoTextAnim")?.checked) playTextAnimation();

    Object.keys(themeGroups).forEach((k) => {
      const g = themeGroups[k];
      if (parseInt(k, 10) === index) {
        g.visible = true;
        gsap.killTweensOf(g.scale);
        gsap.fromTo(g.scale, { x: 0.01, y: 0.01, z: 0.01 }, { x: 1, y: 1, z: 1, duration: 1.2, ease: "back.out(1.2)" });
      } else if (g.visible) {
        gsap.killTweensOf(g.scale);
        gsap.to(g.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.6, ease: "power2.in", onComplete: () => (g.visible = false) });
      }
    });

    const bg = new THREE.Color(t.bg);
    const floorColor = new THREE.Color(t.floor);
    const spotColor = new THREE.Color(t.spotColor);
    const fillColor = new THREE.Color(t.fillColor);
    const rimColor = new THREE.Color(t.rimColor);
    const dur = 1.8;
    gsap.to(scene.background, { r: bg.r, g: bg.g, b: bg.b, duration: dur });
    gsap.to(scene.fog.color, { r: bg.r, g: bg.g, b: bg.b, duration: dur });
    gsap.to(scene.fog, { density: t.fogDensity, duration: dur });
    gsap.to(floorMat.color, { r: floorColor.r, g: floorColor.g, b: floorColor.b, duration: dur });
    gsap.to(floorMat, { roughness: t.floorRough, metalness: t.floorMetal, duration: dur });
    gsap.to(ambientLight, { intensity: t.ambInt, duration: dur });
    gsap.to(spotLight, { intensity: t.spotInt, duration: dur });
    gsap.to(spotLight.color, { r: spotColor.r, g: spotColor.g, b: spotColor.b, duration: dur });
    gsap.to(fillLight, { intensity: t.fillInt, duration: dur });
    gsap.to(fillLight.color, { r: fillColor.r, g: fillColor.g, b: fillColor.b, duration: dur });
    gsap.to(rimLight, { intensity: t.rimInt, duration: dur });
    gsap.to(rimLight.color, { r: rimColor.r, g: rimColor.g, b: rimColor.b, duration: dur });
    gsap.to(underglowLight, { intensity: t.underglow, duration: dur });
  }

  function toggleTheme(index) {
    applyThemeVisuals(index);
    if (isAutoMixRunning) toggleAutoMix();
  }

  function stopCinematic() {
    if (cinematicTL) {
      cinematicTL.kill();
      cinematicTL = null;
    }
    gsap.killTweensOf([camera.position, cameraRig.position, controls.target, spinContainer.rotation]);
    isCinematicRunning = false;
  }

  function getShowcaseCameraDistance(layout = carouselLayout) {
    const profile = getDeviceProfile();
    const boost = profile.carouselBoost || 0;
    const isWebDevice = deviceMode === "web";
    if (isWebDevice && mediaPlanes.length > 2) {
      const distances = {
        curve: 8.2,
        horizontal: 7.8,
        coverflow: 7.5,
        fan: 7.3,
      };
      return distances[layout] || 7.6;
    }
    if (mediaPlanes.length <= 2) return 8 + boost;
    const distances = {
      wall: 12.6,
      orbit: 12.2,
      curve: 12,
      horizontal: 11.8,
      coverflow: 11.4,
      fan: 11.2,
      stack: 10.4,
    };
    return (distances[layout] || 11) + boost;
  }

  function frameShowcase(duration = 0.8) {
    if (!camera || !controls || !bobContainer || !spinContainer) return;
    const targetCenter = new THREE.Vector3();
    bobContainer.getWorldPosition(targetCenter);
    const camDist = getShowcaseCameraDistance();

    gsap.killTweensOf([camera.position, controls.target, spinContainer.rotation]);
    gsap.to(camera.position, { x: 0, y: 1.45, z: camDist, duration, ease: "power3.out" });
    gsap.to(controls.target, { x: targetCenter.x, y: targetCenter.y, z: targetCenter.z, duration, ease: "power3.out" });
    gsap.to(spinContainer.rotation, { y: 0, duration, ease: "power3.out" });
  }

  function setManualMode() {
    stopCinematic();
    controls.enabled = true;
    frameShowcase(0.8);
    updateActiveButtonClass("cam-group", "camManual");
  }

  function playCinematic(type) {
    stopCinematic();
    isCinematicRunning = true;
    controls.enabled = false;
    gsap.set(spinContainer.rotation, { y: 0 });
    const camDist = getShowcaseCameraDistance();
    gsap.set(cameraRig.position, { x: 0, y: 1.5, z: camDist });
    cinematicTL = gsap.timeline({ repeat: -1, yoyo: true });
    if (type === "dolly") {
      updateActiveButtonClass("cam-group", "cam1");
      cinematicTL.to(cameraRig.position, { z: camDist - 3, duration: 4, ease: "power2.inOut" });
    } else if (type === "orbit") {
      updateActiveButtonClass("cam-group", "cam2");
      gsap.set(cameraRig.position, { x: -4, z: camDist });
      cinematicTL.to(cameraRig.position, { x: 4, duration: 6, ease: "power2.inOut" });
    } else if (type === "spin") {
      updateActiveButtonClass("cam-group", "cam3");
      cinematicTL = gsap.timeline({ repeat: -1 });
      cinematicTL.to(spinContainer.rotation, { y: Math.PI * 2, duration: 8, ease: "none" });
      gsap.to(cameraRig.position, { z: camDist + 2, duration: 4, yoyo: true, repeat: -1, ease: "sine.inOut" });
    } else {
      updateActiveButtonClass("cam-group", "camMix");
      cinematicTL = gsap.timeline({ repeat: -1 });
      cinematicTL
        .to(cameraRig.position, { x: -3.5, y: 0.5, z: camDist - 1.5, duration: 4, ease: "power2.inOut" }, 0)
        .to(spinContainer.rotation, { y: -0.5, duration: 4, ease: "power2.inOut" }, 0)
        .to(cameraRig.position, { x: 3.5, y: 2.5, z: camDist - 1, duration: 5, ease: "power1.inOut" }, ">")
        .to(spinContainer.rotation, { y: 0.5, duration: 5, ease: "power1.inOut" }, "<")
        .to(cameraRig.position, { x: 0, y: 1.5, z: camDist, duration: 4, ease: "power2.inOut" }, ">")
        .to(spinContainer.rotation, { y: 0, duration: 4, ease: "power2.inOut" }, "<");
    }
  }

  function updateToolButton(buttonId, active, activeLabel, inactiveLabel) {
    const btn = qs(buttonId);
    if (!btn) return;
    btn.classList.toggle("btn-active", active);
    btn.classList.toggle("is-active", active);
    btn.title = active ? activeLabel : inactiveLabel;
    btn.setAttribute("aria-label", btn.title);
    btn.setAttribute("aria-pressed", String(active));
  }

  function removeDisabledLayoutButtons() {
    ["btnLayoutS", "btnLayoutW", "btnLayoutO"].forEach((id) => qs(id)?.remove());
  }

  function applyShowcaseUiClarity() {
    if (qs("showcaseUiClarityStyle")) return;

    const style = document.createElement("style");
    style.id = "showcaseUiClarityStyle";
    style.textContent = `
      .showcase-project-list .project-media-btn {
        background: rgba(10, 10, 12, 0.94) !important;
        border-color: rgba(255, 255, 255, 0.26) !important;
      }

      .showcase-tool {
        background: rgba(12, 13, 16, 0.88) !important;
        border-color: rgba(255, 255, 255, 0.24) !important;
      }

    `;

    document.head.appendChild(style);
  }

  function updateShowcaseModeHint(message) {
    const hint = qs("showcaseModeHint");
    if (!hint) return;
    clearTimeout(showcaseHintTimer);

    if (isPreviewMode || isDevicePreviewOpen) {
      hint.classList.add("hidden");
      if (window.gsap) gsap.set(hint, { opacity: 0 });
      return;
    }

    hint.classList.remove("hidden");
    hint.textContent = message;

    if (window.gsap) {
      gsap.fromTo(hint, { opacity: 0.55, y: -4 }, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" });
    }

    showcaseHintTimer = setTimeout(() => {
      if (isPreviewMode || isDevicePreviewOpen) return;
      if (window.gsap) {
        gsap.to(hint, {
          opacity: 0,
          y: -4,
          duration: 0.24,
          ease: "power2.in",
          onComplete: () => hint.classList.add("hidden"),
        });
      } else {
        hint.classList.add("hidden");
      }
    }, 3000);
  }

  function installShowcaseHintObserver() {
    const section = qs("showcase-3d");
    if (!section || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.35) return;
          updateShowcaseModeHint(isAutoMixRunning ? "Sinematik aktif: kamera, tema, dan layout berubah otomatis." : "Pilih Perbesar atau Geser untuk kontrol manual.");
        });
      },
      { threshold: [0.35] },
    );
    observer.observe(section);
  }

  function updateLiveCinematicButton() {
    updateToolButton("autoMixBtn", isAutoMixRunning, "Sinematik aktif", "Sinematik nonaktif");
  }

  function updateDragModeButton() {
    updateToolButton("dragModeBtn", isDragMode, "Geser bebas aktif", "Geser bebas nonaktif");
  }

  function toggleAutoMix() {
    isAutoMixRunning = !isAutoMixRunning;
    if (isAutoMixRunning) {
      isDragMode = false;
      updateDragModeButton();
      playCinematic("mix");
      runAutoMixStep();
    } else {
      stopCinematic();
      controls.enabled = isDragMode && !isPreviewMode && !isDevicePreviewOpen;
      frameShowcase(0.85);
      clearTimeout(autoMixTimer);
    }
    updateLiveCinematicButton();
    updateShowcaseModeHint(isAutoMixRunning ? "Sinematik aktif: kamera, tema, dan layout berubah otomatis." : "Sinematik mati: pilih Perbesar atau Geser untuk kontrol manual.");
  }

  function toggleDragMode(force) {
    isDragMode = typeof force === "boolean" ? force : !isDragMode;

    if (isDragMode) {
      if (isAutoMixRunning) toggleAutoMix();
      if (isPreviewMode) togglePreviewMode(false);
      setManualMode();
      controls.enabled = true;
    } else if (controls) {
      controls.enabled = false;
    }

    updateDragModeButton();
    updateShowcaseModeHint(isDragMode ? "Geser aktif: klik dan geser showcase untuk mengatur sudut pandang." : "Geser mati: aktifkan Sinematik atau Perbesar untuk mode lain.");
  }

  function runAutoMixStep() {
    if (!isAutoMixRunning) return;
    const step = autoCinematicStep++;
    mixThemeIndex = (mixThemeIndex + 1) % selectedThemes.length;
    applyThemeVisuals(selectedThemes[mixThemeIndex]);
    setCarouselLayout(autoLayouts[step % autoLayouts.length]);
    playCinematic(autoCameras[step % autoCameras.length]);
    if (mediaPlanes.length > 1) transitionToScreen((currentActiveIndex + 1) % mediaPlanes.length, 1.15);
    playTextAnimation(autoTextAnimations[step % autoTextAnimations.length]);
    autoMixTimer = setTimeout(runAutoMixStep, 5000);
  }

  function changeDeviceColor(hex) {
    const color = new THREE.Color(hex);
    gsap.to(bodyMat.color, { r: color.r, g: color.g, b: color.b, duration: 0.5 });
    gsap.to(btnMat.color, { r: color.r, g: color.g, b: color.b, duration: 0.5 });
  }

  function setDeviceStyle(style) {
    currentDeviceStyle = style;
    if (deviceMode !== "mobile") return;
    if (notch) notch.visible = style === "iphone";
    if (punchHoleGroup) punchHoleGroup.visible = style !== "iphone";
  }

  function updateDeviceModeButtons() {
    document.querySelectorAll(".device-mode-btn").forEach((button) => {
      const isActive = button.dataset.deviceMode === deviceMode;
      button.classList.toggle("btn-active", isActive);
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  async function applyDeviceMode(mode, options = {}) {
    const reloadProject = options.reloadProject ?? true;
    if (!deviceProfiles[mode] || !phoneGroup) return;
    if (mode === deviceMode) {
      updateDeviceModeButtons();
      return;
    }

    const activeProject = currentProjectIndex;
    if (isDevicePreviewOpen) exitDevicePreview({ keepPreviewMode: false });
    if (isAutoMixRunning) toggleAutoMix();
    if (isDragMode) toggleDragMode(false);
    stopCinematic();
    mediaLoadToken += 1;
    clearProjectMedia();

    deviceMode = mode;
    buildDeviceModel();
    updateShowcaseModeHint(deviceMode === "web" ? "Mode web aktif: UI ditampilkan di laptop dan gambar panjang scroll otomatis." : "Mode mobile aktif: UI ditampilkan di smartphone dan gambar panjang scroll otomatis.");
    if (reloadProject) await loadProjectMedia(activeProject);
  }

  async function setDeviceMode(mode) {
    await applyDeviceMode(mode, { reloadProject: true });
  }

  function setTextureColorSpace(texture) {
    if ("colorSpace" in texture && THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
    else texture.encoding = THREE.sRGBEncoding || texture.encoding;
  }

  function inferMediaType(item) {
    if (item.type) return item.type;
    return /\.(mp4|webm|ogg|mov)$/i.test(item.src || "") ? "video" : "image";
  }

  function getActiveShowcaseGroup() {
    return showcaseGroups.find((group) => group.id === activeProjectGroup) || showcaseGroups[0];
  }

  function getVisibleProjects() {
    return cinematicProjects.map((project, index) => ({ project, index })).filter(({ project }) => project.showcaseGroup === activeProjectGroup);
  }

  function getProjectMedia(project) {
    if (activeContentType === "video" && project?.videoMedia?.length) return project.videoMedia;
    return project?.media?.length ? project.media : [];
  }

  function normalizeActiveContentType() {
    const group = getActiveShowcaseGroup();
    if (!group.allowVideo) activeContentType = "ui";
  }

  function clearProjectMedia() {
    screenTransitioning = false;
    mediaPlanes.forEach((p) => {
      phoneGroup.remove(p);
      const maps = [p.material?.map, p.material?.emissiveMap].filter(Boolean);
      maps.forEach((map, index) => {
        if (maps.indexOf(map) === index) map.dispose?.();
      });
      p.geometry?.dispose();
      p.material?.dispose();
    });
    mediaPlanes = [];
    currentVideos.forEach((v) => {
      if (v) {
        v.pause();
        v.removeAttribute("src");
        v.load();
      }
    });
    currentVideos = [];
    scrollTextures = [];
    stopCarousel();
  }

  function updateProjectCopy(project) {
    const title = project?.title || "";
    const headline = project?.headline || "Showcase Proyek 3D";
    const description = project?.description || "";
    const category = project?.category || "PORTFOLIO";
    const tech = project?.tech || "";

    qs("promoHeadline").innerText = headline;
    qs("promoSubline").innerText = title;
    qs("promoDesc").innerText = description;
    qs("promoCategory").innerText = category;
    qs("promoTech").innerText = tech;

    if (qs("inputHeadline")) qs("inputHeadline").value = headline;
    if (qs("inputSubline")) qs("inputSubline").value = title;
    if (qs("inputDesc")) qs("inputDesc").value = description;

    if (qs("autoTextAnim")?.checked) playTextAnimation();
  }

  function renderProjectMediaControls() {
    const controlBoxes = [qs("projectMediaControls"), qs("legacyProjectMediaControls")].filter(Boolean);
    if (!controlBoxes.length) return;
    normalizeActiveContentType();
    const compactControls = getSize().width < 768;
    lastCompactShowcaseControls = compactControls;

    function createControlRow(label, tone = "default") {
      const row = document.createElement("div");
      row.className = `showcase-control-row showcase-control-row-${tone}`;

      const labelEl = document.createElement("span");
      labelEl.className = "showcase-control-label";
      labelEl.textContent = label;

      const actions = document.createElement("div");
      actions.className = "showcase-control-actions";

      row.append(labelEl, actions);
      return { row, actions };
    }

    controlBoxes.forEach((controlsBox) => {
      controlsBox.innerHTML = "";
      controlsBox.classList.add("showcase-control-panel");

      const activeGroup = getActiveShowcaseGroup();
      const { row: groupRow, actions: groupActions } = createControlRow(compactControls ? "" : "Jenis Proyek", "type");
      showcaseGroups.forEach((group) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.groupId = group.id;
        button.className = "showcase-group-btn showcase-choice-btn";
        button.textContent = group.label;
        button.addEventListener("click", () => switchShowcaseGroup(group.id));
        groupActions.appendChild(button);
      });

      if (activeGroup.allowVideo) {
        const contentTargetActions = compactControls ? groupActions : createControlRow("Kategori Konten", "content").actions;
        const contentRow = compactControls ? null : contentTargetActions.closest(".showcase-control-row");
        [
          { id: "ui", label: compactControls ? "UI" : "Tampilan UI" },
          { id: "video", label: compactControls ? "Video" : "Video Konten" },
        ].forEach((content) => {
          const button = document.createElement("button");
          button.type = "button";
          button.dataset.contentType = content.id;
          button.className = "showcase-content-btn showcase-choice-btn";
          button.textContent = content.label;
          button.addEventListener("click", () => switchProjectContent(content.id));
          contentTargetActions.appendChild(button);
        });
        if (contentRow) {
          controlsBox.appendChild(groupRow);
          controlsBox.appendChild(contentRow);
        } else {
          controlsBox.appendChild(groupRow);
        }
      } else {
        controlsBox.appendChild(groupRow);
      }

      const { row: projectRow, actions: projectActions } = createControlRow(compactControls ? "" : "Daftar Proyek", "project");
      getVisibleProjects().forEach(({ project, index }) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.projectIndex = String(index);
        button.className = "project-media-btn showcase-choice-btn";
        button.textContent = project.title;
        button.addEventListener("click", () => {
          if (isPreviewMode || isDevicePreviewOpen) {
            previewProjectFromExternalUI(index, button);
          } else {
            loadProjectMedia(index);
          }
        });
        projectActions.appendChild(button);
      });
      controlsBox.appendChild(projectRow);
    });
    updateProjectButtonState(currentProjectIndex);
    updateShowcaseFilterState();
  }

  function updateProjectButtonState(activeIndex) {
    document.querySelectorAll(".project-media-btn").forEach((button) => {
      const isActive = Number(button.dataset.projectIndex) === activeIndex;
      button.classList.toggle("btn-active", isActive);
      button.classList.toggle("border-blue-400", isActive);
      button.classList.toggle("border-gray-600", !isActive);
    });
  }

  function updateShowcaseFilterState() {
    document.querySelectorAll(".showcase-group-btn").forEach((button) => {
      const isActive = button.dataset.groupId === activeProjectGroup;
      button.classList.toggle("btn-active", isActive);
      button.classList.toggle("border-blue-400", isActive);
      button.classList.toggle("border-gray-600", !isActive);
    });

    document.querySelectorAll(".showcase-content-btn").forEach((button) => {
      const isActive = button.dataset.contentType === activeContentType;
      button.classList.toggle("btn-active", isActive);
      button.classList.toggle("border-blue-400", isActive);
      button.classList.toggle("border-gray-600", !isActive);
    });
  }

  async function switchShowcaseGroup(groupId) {
    const group = showcaseGroups.find((item) => item.id === groupId);
    if (!group) return;

    activeProjectGroup = group.id;
    normalizeActiveContentType();
    renderProjectMediaControls();
    await applyDeviceMode(group.deviceMode, { reloadProject: false });

    const firstProject = getVisibleProjects()[0];
    if (firstProject) await loadProjectMedia(firstProject.index);
  }

  async function switchProjectContent(contentType) {
    const group = getActiveShowcaseGroup();
    if (contentType === "video" && !group.allowVideo) return;
    activeContentType = contentType === "video" ? "video" : "ui";
    renderProjectMediaControls();
    await loadProjectMedia(currentProjectIndex);
  }

  function loadImageTexture(src, project) {
    return new Promise((resolve) => {
      const image = new Image();
      if (/^https?:\/\//i.test(src)) image.crossOrigin = "anonymous";
      image.decoding = "async";
      image.onload = async () => {
        try {
          if (image.decode) await image.decode();
        } catch {
          // onload already guarantees dimensions; decode failures can still draw in most browsers.
        }
        resolve(createViewportImageTexture(image, project));
      };
      image.onerror = () => resolve(createDefaultPromoTexture(project));
      image.src = src;
    });
  }

  function createViewportImageTexture(image, project) {
    if (!image?.width || !image?.height) return createDefaultPromoTexture(project);

    const profile = getDeviceProfile();
    const screenAspect = profile.screenWidth / profile.screenHeight;
    let canvasWidth = screenAspect >= 1 ? 1280 : 720;
    let canvasHeight = Math.round(canvasWidth / screenAspect);

    if (canvasHeight > 1600) {
      canvasHeight = 1600;
      canvasWidth = Math.round(canvasHeight * screenAspect);
    }

    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    const imageAspect = image.width / image.height;
    const fitWidth = imageAspect <= screenAspect;
    const drawWidth = fitWidth ? canvasWidth : canvasHeight * imageAspect;
    const drawHeight = fitWidth ? canvasWidth / imageAspect : canvasHeight;
    const maxScrollY = Math.max(0, drawHeight - canvasHeight);
    const maxScrollX = Math.max(0, drawWidth - canvasWidth);
    const meta = {
      canvas,
      ctx,
      image,
      canvasWidth,
      canvasHeight,
      drawWidth,
      drawHeight,
      maxScrollY,
      maxScrollX,
      lastFrame: 0,
      duration: Math.max(7, Math.min(16, maxScrollY / 170)),
    };

    drawViewportImage(meta, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    setTextureColorSpace(texture);

    if (maxScrollY > canvasHeight * 0.08) {
      texture.userData = texture.userData || {};
      texture.userData.scrollMeta = meta;
      scrollTextures.push(texture);
    }

    return texture;
  }

  function drawViewportImage(meta, scrollY = 0) {
    const { ctx, image, canvasWidth, canvasHeight, drawWidth, drawHeight, maxScrollX } = meta;
    const x = maxScrollX ? -maxScrollX / 2 : 0;
    const y = -scrollY;

    ctx.fillStyle = "#050607";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
  }

  function updateScrollingTextures(elapsedTime) {
    scrollTextures.forEach((texture) => {
      const meta = texture.userData.scrollMeta;
      if (!meta?.maxScrollY) return;
      if (elapsedTime - meta.lastFrame < 1 / 30) return;

      meta.lastFrame = elapsedTime;
      const pause = 1.15;
      const cycle = meta.duration + pause * 2;
      const t = elapsedTime % cycle;
      const progress = t < pause ? 0 : t > pause + meta.duration ? 1 : Math.min(1, (t - pause) / meta.duration);
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      drawViewportImage(meta, meta.maxScrollY * eased);
      texture.needsUpdate = true;
    });
  }

  function loadVideoTexture(src) {
    const video = document.createElement("video");
    video.src = src;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = "auto";
    video.play().catch(() => {});
    currentVideos.push(video);
    const texture = new THREE.VideoTexture(video);
    setTextureColorSpace(texture);
    return texture;
  }

  function createScreenMesh(texture, item, projectIndex, isLoaded = true) {
    const screenMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: texture,
      transparent: true,
      opacity: isLoaded ? 1 : 0,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const screenMesh = new THREE.Mesh(baseScreen.geometry.clone(), screenMat);
    screenMesh.position.z = getScreenZ();
    screenMesh.userData = {
      mediaItem: item,
      mediaIndex: mediaPlanes.length,
      projectIndex,
      isLoaded,
    };
    phoneGroup.add(screenMesh);
    mediaPlanes.push(screenMesh);
    return screenMesh;
  }

  function normalizeMediaIndex(mediaIndex = currentActiveIndex) {
    const media = currentProjectMedia.length ? currentProjectMedia : cinematicProjects[currentProjectIndex]?.media || [];
    if (!media.length) return 0;
    return ((mediaIndex % media.length) + media.length) % media.length;
  }

  function updatePreviewModeButton() {
    updateToolButton("previewModeBtn", isPreviewMode, "Mode perbesar aktif", "Mode perbesar nonaktif");

    if (renderer?.domElement) {
      renderer.domElement.style.cursor = isDevicePreviewOpen ? "zoom-out" : isPreviewMode ? "pointer" : "grab";
    }
  }

  function togglePreviewMode(force) {
    isPreviewMode = typeof force === "boolean" ? force : !isPreviewMode;

    if (isPreviewMode) {
      if (isAutoMixRunning) toggleAutoMix();
      if (isDragMode) toggleDragMode(false);
    }

    if (!isPreviewMode && isDevicePreviewOpen) {
      exitDevicePreview({ keepPreviewMode: false });
    }

    updatePreviewModeButton();
    updateShowcaseModeHint(isPreviewMode ? "Perbesar aktif: klik screen showcase yang ingin dilihat lebih dekat." : "Perbesar mati: aktifkan Sinematik atau Geser untuk mode lain.");

    if (controls) {
      controls.enabled = !isPreviewMode && !isDevicePreviewOpen && !isCinematicRunning;
    }
  }

  function handlePreviewToolClick() {
    if (getSize().width < 768) {
      if (isDevicePreviewOpen) {
        exitDevicePreview({ keepPreviewMode: false });
      } else if (isPreviewMode) {
        togglePreviewMode(false);
      } else {
        openPreviewMedia(currentActiveIndex);
      }
      return;
    }

    togglePreviewMode();
  }

  function getPreviewHit(event) {
    if (!camera || !raycaster || !pointer || !renderer || !mediaPlanes.length) return null;

    const rect = renderer.domElement.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      return null;
    }

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(mediaPlanes, false)[0] || null;
  }

  function handlePreviewPointer(event) {
    if (!camera || !raycaster || !pointer || !mediaPlanes.length) return;

    const hit = getPreviewHit(event);

    if (isDevicePreviewOpen) {
      event.preventDefault();

      if (hit) {
        const hitIndex = hit.object?.userData?.mediaIndex ?? currentActiveIndex;
        enterDevicePreview(hitIndex);
      } else {
        exitDevicePreview();
      }

      return;
    }

    if (!isPreviewMode) return;

    event.preventDefault();

    if (hit) {
      const hitIndex = hit.object?.userData?.mediaIndex ?? currentActiveIndex;
      enterDevicePreview(hitIndex);
    }
  }

  function showPreviewHelp() {
    if (previewHelpEl) previewHelpEl.remove();

    previewHelpEl = document.createElement("div");
    previewHelpEl.className = "fixed left-1/2 top-6 z-[90] -translate-x-1/2 rounded-full border border-brand/40 bg-black/70 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_25px_rgba(0,210,122,0.25)] backdrop-blur-md";
    previewHelpEl.innerHTML = "Klik area luar device untuk kembali";

    document.body.appendChild(previewHelpEl);

    gsap.fromTo(previewHelpEl, { opacity: 0, y: -12, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power2.out" });
  }

  function hidePreviewHelp() {
    if (!previewHelpEl) return;

    gsap.to(previewHelpEl, {
      opacity: 0,
      y: -12,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        previewHelpEl?.remove();
        previewHelpEl = null;
      },
    });
  }

  function enterDevicePreview(mediaIndex = currentActiveIndex) {
    if (!camera || !controls || !phoneGroup || !bobContainer || !mediaPlanes.length) return;

    const safeIndex = normalizeMediaIndex(mediaIndex);

    if (safeIndex !== currentActiveIndex) {
      transitionToScreen(safeIndex, 0.65);
    }

    if (!isDevicePreviewOpen) {
      devicePreviewSnapshot = {
        cameraPosition: camera.position.clone(),
        target: controls.target.clone(),
        phoneScale: phoneGroup.scale.clone(),
        phonePosition: phoneGroup.position.clone(),
        phoneRotation: phoneGroup.rotation.clone(),
      };
    }

    isDevicePreviewOpen = true;
    isPreviewMode = true;
    updatePreviewModeButton();

    if (isAutoMixRunning) toggleAutoMix();
    stopCinematic();
    stopCarousel();

    controls.enabled = false;
    isSliding = false;

    camera.clearViewOffset();
    camera.updateProjectionMatrix();

    const center = new THREE.Vector3();
    bobContainer.getWorldPosition(center);

    const zoomDistance = deviceMode === "web" ? (window.innerWidth < 768 ? 6.2 : 4.8) : 5.5;
    const targetPoint = center.clone().add(new THREE.Vector3(0, 0.08, 0));
    const zoomCameraPos = new THREE.Vector3(center.x, center.y + 0.12, center.z + zoomDistance);

    const baseScale = devicePreviewSnapshot?.phoneScale || phoneGroup.scale.clone();
    const zoomScale = baseScale.clone().multiplyScalar(deviceMode === "web" ? (window.innerWidth < 768 ? 1.12 : 1.22) : window.innerWidth < 768 ? 1.2 : 1.28);

    gsap.killTweensOf([camera.position, controls.target, phoneGroup.scale, phoneGroup.position, phoneGroup.rotation]);

    gsap.to(camera.position, {
      x: zoomCameraPos.x,
      y: zoomCameraPos.y,
      z: zoomCameraPos.z,
      duration: 0.85,
      ease: "power3.inOut",
    });

    gsap.to(controls.target, {
      x: targetPoint.x,
      y: targetPoint.y,
      z: targetPoint.z,
      duration: 0.85,
      ease: "power3.inOut",
    });

    gsap.to(phoneGroup.scale, {
      x: zoomScale.x,
      y: zoomScale.y,
      z: zoomScale.z,
      duration: 0.85,
      ease: "back.out(1.15)",
    });

    const previewYOffset = deviceMode === "web" ? 0.08 : 0.35;

    gsap.to(phoneGroup.position, {
      y: (devicePreviewSnapshot?.phonePosition?.y || 0) + previewYOffset,
      duration: 0.85,
      ease: "power3.out",
    });

    gsap.to(phoneGroup.rotation, {
      x: -0.015,
      y: 0,
      z: 0,
      duration: 0.85,
      ease: "power3.out",
    });

    gsap.to("#promoOverlay", {
      opacity: 0,
      duration: 0.35,
      ease: "power2.out",
      pointerEvents: "none",
    });

    hidePreviewHelp();

    const hint = qs("showcaseModeHint");
    if (hint) hint.classList.add("hidden");
  }

  function exitDevicePreview(options = {}) {
    if (!isDevicePreviewOpen || !devicePreviewSnapshot) return;

    const keepPreviewMode = options.keepPreviewMode ?? true;

    isDevicePreviewOpen = false;
    isPreviewMode = keepPreviewMode;

    gsap.killTweensOf([camera.position, controls.target, phoneGroup.scale, phoneGroup.position, phoneGroup.rotation]);

    updateCameraFraming();

    gsap.to(camera.position, {
      x: devicePreviewSnapshot.cameraPosition.x,
      y: devicePreviewSnapshot.cameraPosition.y,
      z: devicePreviewSnapshot.cameraPosition.z,
      duration: 0.75,
      ease: "power3.inOut",
    });

    gsap.to(controls.target, {
      x: devicePreviewSnapshot.target.x,
      y: devicePreviewSnapshot.target.y,
      z: devicePreviewSnapshot.target.z,
      duration: 0.75,
      ease: "power3.inOut",
    });

    gsap.to(phoneGroup.scale, {
      x: devicePreviewSnapshot.phoneScale.x,
      y: devicePreviewSnapshot.phoneScale.y,
      z: devicePreviewSnapshot.phoneScale.z,
      duration: 0.75,
      ease: "power3.out",
    });

    gsap.to(phoneGroup.position, {
      x: devicePreviewSnapshot.phonePosition.x,
      y: devicePreviewSnapshot.phonePosition.y,
      z: devicePreviewSnapshot.phonePosition.z,
      duration: 0.75,
      ease: "power3.out",
    });

    gsap.to(phoneGroup.rotation, {
      x: devicePreviewSnapshot.phoneRotation.x,
      y: devicePreviewSnapshot.phoneRotation.y,
      z: devicePreviewSnapshot.phoneRotation.z,
      duration: 0.75,
      ease: "power3.out",
    });

    if (isPromoTextVisible) {
      gsap.to("#promoOverlay", {
        opacity: 1,
        duration: 0.35,
        ease: "power2.out",
        pointerEvents: "none",
      });
    }

    controls.enabled = !isPreviewMode && !isCinematicRunning;
    updatePreviewModeButton();
    hidePreviewHelp();

    devicePreviewSnapshot = null;
  }

  function openPreviewMedia(mediaIndex = currentActiveIndex) {
    enterDevicePreview(mediaIndex);
  }

  function closePreviewMedia() {
    exitDevicePreview();
  }

  function animateExternalPreviewToDevice(sourceElement, mediaIndex = currentActiveIndex) {
    if (!sourceElement || !renderer || !camera || !phoneGroup || !window.gsap) {
      enterDevicePreview(mediaIndex);
      return;
    }

    const startRect = sourceElement.getBoundingClientRect();
    const canvasRect = renderer.domElement.getBoundingClientRect();

    const screenWorld = new THREE.Vector3(0, 0, getScreenZ() + 0.06);
    phoneGroup.localToWorld(screenWorld);
    screenWorld.project(camera);

    const endX = canvasRect.left + (screenWorld.x * 0.5 + 0.5) * canvasRect.width;
    const endY = canvasRect.top + (-screenWorld.y * 0.5 + 0.5) * canvasRect.height;

    const flyer = sourceElement.cloneNode(true);
    flyer.style.position = "fixed";
    flyer.style.left = `${startRect.left}px`;
    flyer.style.top = `${startRect.top}px`;
    flyer.style.width = `${startRect.width}px`;
    flyer.style.height = `${startRect.height}px`;
    flyer.style.zIndex = "95";
    flyer.style.pointerEvents = "none";
    flyer.style.transformOrigin = "center center";
    flyer.style.boxShadow = "0 0 30px rgba(0,210,122,0.45)";

    document.body.appendChild(flyer);

    gsap.to(flyer, {
      x: endX - startRect.left - startRect.width / 2,
      y: endY - startRect.top - startRect.height / 2,
      scale: 0.18,
      rotation: 8,
      opacity: 0,
      duration: 0.65,
      ease: "power3.inOut",
      onComplete: () => {
        flyer.remove();
        enterDevicePreview(mediaIndex);
      },
    });
  }

  async function previewProjectFromExternalUI(projectIndex, sourceElement) {
    await loadProjectMedia(projectIndex);
    animateExternalPreviewToDevice(sourceElement, currentActiveIndex);
  }

  function previewNext() {
    if (!currentProjectMedia.length) return;
    openPreviewMedia((currentActiveIndex + 1) % currentProjectMedia.length);
  }

  function previewPrev() {
    if (!currentProjectMedia.length) return;
    openPreviewMedia((currentActiveIndex - 1 + currentProjectMedia.length) % currentProjectMedia.length);
  }

  async function loadProjectMedia(projectIndex = 0) {
    const loadToken = ++mediaLoadToken;
    const project = cinematicProjects[projectIndex] || cinematicProjects[0];
    currentProjectIndex = projectIndex;
    const selectedMedia = getProjectMedia(project);
    currentProjectMedia = selectedMedia.length ? selectedMedia : [];
    updateProjectButtonState(projectIndex);
    updateShowcaseFilterState();
    updateProjectCopy(project);
    clearProjectMedia();
    baseScreen.visible = true;

    const projectMedia = selectedMedia.length ? selectedMedia : [{ src: "", type: "fallback" }];
    currentActiveIndex = 0;

    async function resolveTexture(item) {
      const type = inferMediaType(item);
      if (type === "video") {
        return { texture: loadVideoTexture(item.src), type };
      }
      if (type === "video-placeholder") {
        return { texture: createVideoPlaceholderTexture(project), type };
      }
      if (item.src) {
        return { texture: await loadImageTexture(item.src, project), type };
      }
      return { texture: createDefaultPromoTexture(project), type };
    }

    const firstItem = projectMedia[0];
    const firstResult = await resolveTexture(firstItem);
    if (loadToken !== mediaLoadToken) {
      firstResult.texture.dispose?.();
      return;
    }

    createScreenMesh(firstResult.texture, firstItem, projectIndex, true);
    currentVideos.push(firstResult.type === "video" ? currentVideos.pop() || null : null);
    baseScreen.visible = false;

    projectMedia.slice(1).forEach((item) => {
      const placeholderTexture = createDefaultPromoTexture(project);
      const screenMesh = createScreenMesh(placeholderTexture, item, projectIndex, false);
      currentVideos.push(null);
      resolveTexture(item).then(({ texture, type }) => {
        if (loadToken !== mediaLoadToken || !mediaPlanes.includes(screenMesh)) {
          texture.dispose?.();
          return;
        }

        const oldTexture = screenMesh.material.map;
        screenMesh.material.map = texture;
        screenMesh.userData.isLoaded = true;
        screenMesh.material.needsUpdate = true;
        oldTexture?.dispose?.();
        if (type === "video") currentVideos[screenMesh.userData.mediaIndex] = currentVideos.pop() || null;
        updateCarouselPositions(0.35);
      });
    });

    updateCarouselPositions(1.5);
    frameShowcase(0.8);
    if (!isAutoMixRunning) toggleAutoMix();
    else playCinematic("mix");
  }

  function setCarouselLayout(layout) {
    carouselLayout = allowedLayouts.includes(layout) ? layout : "horizontal";
    updateCarouselPositions(1.0);

    const layoutButtons = {
      horizontal: "btnLayoutH",
      coverflow: "btnLayoutF",
      fan: "btnLayoutFan",
      curve: "btnLayoutC",
    };

    updateActiveButtonClass("cam-btn", layoutButtons[carouselLayout] || "btnLayoutH");
  }

  function updateCarouselPositions(duration = 0.8) {
    const total = mediaPlanes.length || 1;
    const profile = getDeviceProfile();
    const isWebDevice = deviceMode === "web";
    const spacing = profile.screenWidth * (isWebDevice ? 0.52 : 1.02);
    mediaPlanes.forEach((plane, i) => {
      let offset = i - currentActiveIndex;
      const half = Math.floor(mediaPlanes.length / 2);
      if (offset > half) offset -= mediaPlanes.length;
      if (offset < -half) offset += mediaPlanes.length;
      let targetX = 0;
      let targetY = 0;
      let targetZ = 0;
      let targetRotY = 0;
      let targetRotZ = 0;
      const absOffset = Math.abs(offset);
      let targetScale = offset === 0 ? 1 : Math.max(isWebDevice ? 0.5 : 0.4, 1 - absOffset * (isWebDevice ? 0.18 : 0.15));
      let targetOpacity = 1;
      const baseZ = getScreenZ();

      if (carouselLayout === "horizontal") {
        targetX = offset * spacing;
        targetZ = baseZ - absOffset * (isWebDevice ? 0.22 : 0.15);
        targetRotY = -offset * (isWebDevice ? 0.1 : 0.08);
        if (isWebDevice && offset !== 0) targetScale = Math.max(0.58, 0.82 - absOffset * 0.045);
      } else if (carouselLayout === "coverflow") {
        targetX = offset * spacing * (isWebDevice ? 0.8 : 0.78);
        targetY = absOffset * (isWebDevice ? -0.055 : -0.02);
        targetZ = baseZ - absOffset * (isWebDevice ? 0.42 : 0.36);
        targetRotY = -offset * (isWebDevice ? 0.32 : 0.46);
        targetScale = offset === 0 ? (isWebDevice ? 1.04 : 1.04) : Math.max(isWebDevice ? 0.56 : 0.58, (isWebDevice ? 0.82 : 0.92) - absOffset * 0.07);
      } else if (carouselLayout === "fan") {
        targetX = offset * spacing * (isWebDevice ? 0.66 : 0.66);
        targetY = -absOffset * (isWebDevice ? 0.065 : 0.05);
        targetZ = baseZ - absOffset * (isWebDevice ? 0.3 : 0.22);
        targetRotY = -offset * (isWebDevice ? 0.18 : 0.22);
        targetRotZ = -offset * (isWebDevice ? 0.035 : 0.08);
        targetScale = offset === 0 ? 1.03 : Math.max(isWebDevice ? 0.58 : 0.62, (isWebDevice ? 0.84 : 0.9) - absOffset * 0.065);
        targetOpacity = 1;
      } else if (carouselLayout === "curve") {
        const curveRadius = isWebDevice ? 3.9 : 3;
        targetX = Math.sin(offset * 0.5) * curveRadius;
        targetZ = Math.cos(offset * 0.5) * curveRadius - curveRadius + baseZ;
        targetY = isWebDevice ? -absOffset * 0.03 : 0;
        targetRotY = -offset * (isWebDevice ? 0.34 : 0.5);
        targetScale = offset === 0 ? 1.04 : Math.max(isWebDevice ? 0.56 : 0.5, (isWebDevice ? 0.82 : 1) - absOffset * 0.09);
      }
      if (isWebDevice && offset !== 0) targetOpacity = 0.94;
      gsap.to(plane.position, { x: targetX, y: targetY, z: targetZ, duration, ease: "power3.out" });
      gsap.to(plane.scale, { x: targetScale, y: targetScale, z: targetScale, duration, ease: "power3.out" });
      gsap.to(plane.rotation, { y: targetRotY, z: targetRotZ, duration, ease: "power3.out" });
      if (plane.material) {
        plane.material.transparent = true;
        plane.material.opacity = plane.userData.isLoaded ? targetOpacity : 0;
        plane.material.needsUpdate = true;
      }
    });
  }

  function slideNext() {
    if (!mediaPlanes.length) return;
    transitionToScreen((currentActiveIndex + 1) % mediaPlanes.length, 0.95);
  }

  function transitionToScreen(nextIndex, duration = 0.95) {
    if (!mediaPlanes.length || screenTransitioning) return;

    screenTransitioning = true;
    const next = mediaPlanes[nextIndex];

    currentActiveIndex = nextIndex;
    updateCarouselPositions(duration);

    if (next) {
      gsap.fromTo(next.scale, { x: 0.52, y: 0.52, z: 0.52 }, { x: 1, y: 1, z: 1, duration, ease: "back.out(1.25)" });

      if (next.material) {
        next.material.transparent = false;
        next.material.opacity = 1;
        next.material.needsUpdate = true;
      }
    }

    gsap.set("#promoContent", { opacity: 1, y: 0 });

    setTimeout(
      () => {
        screenTransitioning = false;
      },
      duration * 1000 + 120,
    );
  }

  function toggleCarouselPlay() {
    const btn = qs("btnCarouselPlay");
    if (!btn) return;

    if (!isCarouselPlaying) {
      isCarouselPlaying = true;
      btn.innerHTML = "Stop Slide";
      btn.classList.add("bg-red-500");
      btn.classList.remove("bg-fuchsia-600");
      stopCarousel({ resetState: false });
      slideNext();
      carouselTimer = setInterval(slideNext, 5000);
    } else {
      stopCarousel();
    }
  }

  function stopCarousel(options = {}) {
    if (carouselTimer) clearInterval(carouselTimer);
    carouselTimer = null;

    const resetState = options.resetState ?? true;
    if (!resetState) return;

    isCarouselPlaying = false;
    const btn = qs("btnCarouselPlay");
    if (!btn) return;
    btn.innerHTML = "Auto Slide";
    btn.classList.remove("bg-red-500");
    btn.classList.add("bg-fuchsia-600");
  }

  function togglePlayPause() {
    currentVideos.forEach((v) => {
      if (!v) return;
      if (v.paused) v.play().catch(() => {});
      else v.pause();
    });
  }

  function takeScreenshot() {
    renderer.render(scene, camera);
    const link = document.createElement("a");
    link.download = "App-Promo-Shot.png";
    link.href = renderer.domElement.toDataURL("image/png");
    link.click();
  }

  function toggleRecording() {
    const btn = qs("recordBtn");
    const dot = qs("recordDot");
    const text = qs("recordText");
    if (!isRecording) {
      recordedChunks = [];
      const stream = renderer.domElement.captureStream(60);
      let options = { mimeType: "video/webm; codecs=vp9" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) options = { mimeType: "video/webm" };
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch {
        alert("Browser tidak mendukung perekaman canvas.");
        return;
      }
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: options.mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "App-Promo-Video.webm";
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      };
      mediaRecorder.start();
      isRecording = true;
      btn.classList.add("animate-pulse");
      dot.classList.replace("bg-white", "bg-red-200");
      text.innerText = "Stop";
    } else {
      mediaRecorder.stop();
      isRecording = false;
      btn.classList.remove("animate-pulse");
      dot.classList.replace("bg-red-200", "bg-white");
      text.innerText = "Rekam Video";
    }
  }

  function animateCinematic() {
    requestAnimationFrame(animateCinematic);
    const elapsedTime = performance.now() * 0.001;
    updateScrollingTextures(elapsedTime);
    particles.rotation.y = elapsedTime * 0.05;
    particles.position.y = Math.sin(elapsedTime * 0.2) * 0.5;
    bobContainer.position.y = phoneState.targetY + Math.sin(elapsedTime * 1.5) * 0.06;
    const targetCenter = new THREE.Vector3();
    bobContainer.getWorldPosition(targetCenter);
    if (isCinematicRunning) {
      const rigPos = new THREE.Vector3();
      cameraRig.getWorldPosition(rigPos);
      camera.position.lerp(rigPos, 0.08);
      controls.target.lerp(targetCenter, 0.08);
      camera.lookAt(controls.target);
    } else if (isDevicePreviewOpen) {
      camera.lookAt(controls.target);
    } else if (isSliding) {
      const camDist = getShowcaseCameraDistance();
      camera.position.lerp(new THREE.Vector3(0, 1.5, camDist), 0.08);
      controls.target.lerp(targetCenter, 0.08);
    } else {
      controls.target.copy(targetCenter);
    }
    controls.update();
    renderer.render(scene, camera);
  }

  Object.assign(window, {
    switchTab,
    togglePromoText,
    toggleLayoutSide,
    updateTextScale,
    playTextAnimation,
    updateDeviceScale,
    toggleTheme,
    playCinematic,
    setManualMode,
    toggleAutoMix,
    toggleDragMode,
    setDeviceMode,
    changeDeviceColor,
    setDeviceStyle,
    setCarouselLayout,
    toggleCarouselPlay,
    togglePlayPause,
    takeScreenshot,
    toggleRecording,
    loadProjectMedia,
    handlePreviewToolClick,
    togglePreviewMode,
    openPreviewMedia,
    closePreviewMedia,
    previewProjectFromExternalUI,
    previewNext,
    previewPrev,
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCinematic3D);
  } else {
    initCinematic3D();
  }
})();
