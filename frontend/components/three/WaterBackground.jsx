"use client";

import { useEffect, useRef } from "react";

/**
 * Animated 3D wireframe water-grid, rendered behind page content.
 * Colors follow the active theme mode. `three` is loaded dynamically
 * so this component never breaks server-side rendering.
 */
export default function WaterBackground({ mode = "dark" }) {
  const mountRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let renderer, geometry, material, frameId;

    async function init() {
      const THREE = await import("three");
      const mount = mountRef.current;
      if (!mount || cancelled) return;

      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 5.5, 9);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      geometry = new THREE.PlaneGeometry(34, 34, 56, 56);
      geometry.rotateX(-Math.PI / 2);

      const color = mode === "dark" ? 0x2fbf9e : 0x1b8a6f;
      material = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: mode === "dark" ? 0.16 : 0.1,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const posAttr = geometry.attributes.position;
      const base = Float32Array.from(posAttr.array);
      let t = 0;

      function animate() {
        if (cancelled) return;
        t += 0.005;
        for (let i = 0; i < posAttr.count; i++) {
          const x = base[i * 3];
          const z = base[i * 3 + 2];
          const y = Math.sin(x * 0.35 + t) * 0.4 + Math.cos(z * 0.3 + t * 0.8) * 0.4;
          posAttr.setY(i, y);
        }
        posAttr.needsUpdate = true;
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      }
      animate();

      function handleResize() {
        const w = mount.clientWidth || window.innerWidth;
        const h = mount.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
    }

    const cleanupPromise = init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      cleanupPromise?.then((removeResize) => removeResize && removeResize());
      if (renderer) {
        const mount = mountRef.current;
        if (mount && mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
      geometry?.dispose();
      material?.dispose();
    };
  }, [mode]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
