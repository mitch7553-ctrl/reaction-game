const THREE_MODULE = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export async function createScene(container) {
  let THREE;
  try {
    THREE = await import(THREE_MODULE);
  } catch (error) {
    console.warn("Three.js could not be loaded; using the CSS arena fallback.", error);
    return null;
  }

  try {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
    camera.position.set(0, 0, 7.5);

    scene.add(new THREE.AmbientLight(0xbacaff, 1.8));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(3, 4, 5);
    scene.add(keyLight);
    const accentLight = new THREE.PointLight(0x6ce5dc, 16, 18);
    accentLight.position.set(-3, 1, 2);
    scene.add(accentLight);

    const group = new THREE.Group();
    group.position.y = 0.12;
    scene.add(group);

    const coreGeometry = new THREE.IcosahedronGeometry(0.9, 1);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x7c8cff, metalness: 0.55, roughness: 0.24,
      emissive: 0x303d9c, emissiveIntensity: 0.32, flatShading: true,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    const wireGeometry = new THREE.IcosahedronGeometry(1.17, 1);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x9aa8ff, wireframe: true, transparent: true, opacity: 0.24,
    });
    const wire = new THREE.Mesh(wireGeometry, wireMaterial);
    group.add(wire);

    const ringGeometry = new THREE.TorusGeometry(1.52, 0.009, 8, 120);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x6ce5dc, transparent: true, opacity: 0.55 });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = 1.13;
    group.add(ring);

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.78, 0.006, 6, 120),
      new THREE.MeshBasicMaterial({ color: 0x7c8cff, transparent: true, opacity: 0.3 })
    );
    innerRing.rotation.set(0.72, 0.25, 0.35);
    group.add(innerRing);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let state = "idle";
    let frame = 0;
    let lastFrame = 0;
    let disposed = false;

    const palette = {
      idle: { color: 0x7c8cff, emissive: 0x303d9c, glow: 0x6ce5dc },
      waiting: { color: 0xf4bd66, emissive: 0x7a3c12, glow: 0xf4bd66 },
      ready: { color: 0x4ce0ad, emissive: 0x087c5b, glow: 0x4ce0ad },
      result: { color: 0x7c8cff, emissive: 0x303d9c, glow: 0x7c8cff },
      falseStart: { color: 0xf17d83, emissive: 0x7c1d3b, glow: 0xf17d83 },
    };

    function resize() {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    function animate(now) {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const delta = Math.min((now - (lastFrame || now)) / 1000, 0.05);
      lastFrame = now;
      if (!reducedMotion.matches) {
        group.rotation.y += delta * (state === "ready" ? 0.82 : 0.34);
        group.rotation.x = Math.sin(now * 0.00045) * 0.12;
        wire.rotation.y -= delta * 0.18;
        ring.rotation.z += delta * 0.12;
        innerRing.rotation.y -= delta * 0.08;
      }
      renderer.render(scene, camera);
    }

    frame = requestAnimationFrame(animate);

    return {
      setState(next) {
        state = next;
        const colors = palette[next] || palette.idle;
        coreMaterial.color.setHex(colors.color);
        coreMaterial.emissive.setHex(colors.emissive);
        wireMaterial.color.setHex(colors.color);
        ringMaterial.color.setHex(colors.glow);
        coreMaterial.emissiveIntensity = next === "ready" ? 0.8 : 0.32;
        core.scale.setScalar(next === "ready" ? 1.12 : 1);
      },
      dispose() {
        disposed = true;
        cancelAnimationFrame(frame);
        observer.disconnect();
        coreGeometry.dispose();
        coreMaterial.dispose();
        wireGeometry.dispose();
        wireMaterial.dispose();
        ringGeometry.dispose();
        ringMaterial.dispose();
        innerRing.geometry.dispose();
        innerRing.material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      },
    };
  } catch (error) {
    console.warn("Three.js renderer initialization failed; using the CSS arena fallback.", error);
    container.replaceChildren();
    return null;
  }
}