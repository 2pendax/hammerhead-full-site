(function () {
  "use strict";

  const PALLET_SQFT = (48 / 12) * (40 / 12);
  const WALL_AND_OBSTRUCTION_FACTOR = 0.82;

  const systems = [
    {
      id: "floor",
      name: "Floor stacking",
      description: "Low cost, low selectivity",
      density: 0.42,
      deep: 1,
      color: "#8aa0b8",
    },
    {
      id: "selective",
      name: "Selective rack",
      description: "Direct access to every pallet",
      density: 0.38,
      deep: 1,
      color: "#f26b1d",
    },
    {
      id: "pushback",
      name: "Push-back racking",
      description: "2-5 deep LIFO lanes",
      density: 0.52,
      deep: 4,
      color: "#2d6cdf",
    },
    {
      id: "drivein",
      name: "Drive-in / drive-thru",
      description: "High density, low SKU count",
      density: 0.62,
      deep: 6,
      color: "#1c9a6b",
    },
    {
      id: "flow",
      name: "Pallet flow rack",
      description: "FIFO gravity flow lanes",
      density: 0.58,
      deep: 5,
      color: "#d7a21f",
    },
    {
      id: "shuttle",
      name: "Pallet shuttle",
      description: "Deep lanes with shuttle carts",
      density: 0.68,
      deep: 8,
      color: "#7957d5",
    },
    {
      id: "mobile",
      name: "Mobile pallet racking",
      description: "Dense storage with moving aisles",
      density: 0.72,
      deep: 3,
      color: "#c94168",
    },
  ];

  const $ = (id) => document.getElementById(id);
  let lastState = null;
  let selectedSystemId = "selective";

  function fmt(n) {
    return Math.round(n).toLocaleString();
  }

  function aisleMultiplier(type) {
    if (type === "vna") return 1.22;
    if (type === "narrow") return 1.12;
    return 1;
  }

  function beamLevels(height) {
    const usableHeight = Math.max(0, height - 1.5);
    return Math.max(1, Math.min(8, Math.floor(usableHeight / 5)));
  }

  function currentCapacity(current, grossArea, netArea, levels, aisleFactor) {
    if (current === "floor1") return (grossArea * 0.42) / PALLET_SQFT;
    if (current === "floor2") return (grossArea * 0.42 * 2) / PALLET_SQFT;
    if (current === "floor3") return (grossArea * 0.42 * 3) / PALLET_SQFT;
    if (current === "selective") return (netArea * 0.38 * levels * aisleFactor) / PALLET_SQFT;
    return null;
  }

  function calculate(inputs) {
    const grossArea = inputs.length * inputs.width;
    const netArea = grossArea * WALL_AND_OBSTRUCTION_FACTOR;
    const levels = beamLevels(inputs.height);
    const aisleFactor = aisleMultiplier(inputs.aisle);
    const current = currentCapacity(inputs.current, grossArea, netArea, levels, aisleFactor);

    const rows = systems.map((system) => {
      const floorStackLevels = system.id === "floor" ? Math.min(3, Math.max(1, Math.floor(inputs.height / 7))) : levels;
      const levelFactor = system.id === "floor" ? floorStackLevels : levels;
      const pallets = Math.max(0, Math.floor((netArea * system.density * levelFactor * aisleFactor) / PALLET_SQFT));
      const improvement = current ? ((pallets - current) / current) * 100 : null;
      return { ...system, pallets, improvement };
    }).sort((a, b) => b.pallets - a.pallets);

    return { ...inputs, grossArea, netArea, levels, aisleFactor, current, rows };
  }

  function showError(message) {
    const error = $("calc-error");
    if (!error) return;
    error.textContent = message;
    error.classList.remove("hidden");
  }

  function clearError() {
    const error = $("calc-error");
    if (!error) return;
    error.textContent = "";
    error.classList.add("hidden");
  }

  function readInputs() {
    const length = Number($("calc-length").value);
    const width = Number($("calc-width").value);
    const height = Number($("calc-height").value);
    const aisle = $("calc-aisle").value || "standard";
    const current = $("calc-current").value || "unknown";

    if (!length || !width || !height) {
      throw new Error("Please enter warehouse length, width, and clear height.");
    }
    if (length < 20 || width < 20) {
      throw new Error("Dimensions look too small. Use warehouse dimensions in feet.");
    }
    if (length > 3000 || width > 3000) {
      throw new Error("Dimensions look too large. Please check the values.");
    }

    return { length, width, height, aisle, current };
  }

  function renderResults(state) {
    $("results-prompt")?.classList.add("hidden");
    $("calc-results")?.classList.remove("hidden");
    const reportCard = $("download-report-card");
    if (reportCard) reportCard.style.display = "grid";
    const hint = $("click-hint");
    if (hint) hint.style.display = "block";

    $("res-gross-area").textContent = fmt(state.grossArea);
    $("res-net-area").textContent = fmt(state.netArea);
    $("res-height").textContent = fmt(state.height);
    $("res-levels").textContent = fmt(state.levels);

    const tbody = $("results-tbody");
    tbody.innerHTML = "";

    state.rows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.dataset.system = row.id;
      tr.tabIndex = 0;
      tr.className = "cursor-pointer border-t border-border transition-colors";
      if (row.id === selectedSystemId) tr.style.boxShadow = "inset 3px 0 0 0 var(--color-orange)";

      const improvement = row.improvement == null
        ? "—"
        : `${row.improvement >= 0 ? "+" : ""}${Math.round(row.improvement)}%`;

      tr.innerHTML = `
        <td class="px-3 py-2">
          <div class="font-sans font-semibold text-[13px] text-charcoal">${row.name}</div>
          <div class="text-[11px] text-slate-gray">${row.description}</div>
        </td>
        <td class="px-3 py-2 text-right font-sans font-bold text-[15px] text-steel-blue">${fmt(row.pallets)}</td>
        <td class="px-3 py-2 text-right font-sans font-semibold text-[13px] ${row.improvement >= 0 || row.improvement == null ? "text-emerald-600" : "text-red-600"}">${improvement}</td>
        <td class="px-3 py-2 text-right text-orange font-sans font-semibold text-[12px]">View</td>
      `;

      tr.addEventListener("click", () => selectSystem(row.id));
      tr.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectSystem(row.id);
        }
      });
      tbody.appendChild(tr);
    });
  }

  function selectSystem(id) {
    selectedSystemId = id;
    if (!lastState) return;
    renderResults(lastState);
    drawWarehouse(lastState, systems.find((system) => system.id === id) || systems[1]);
    const hint = $("click-hint");
    if (hint) hint.style.display = "none";
  }

  function iso(x, y, z, originX, originY, scale) {
    return {
      x: originX + (x - y) * scale,
      y: originY + (x + y) * scale * 0.46 - z * scale,
    };
  }

  function drawBox(ctx, x, y, z, w, d, h, color, originX, originY, scale) {
    const p = [
      iso(x, y, z, originX, originY, scale),
      iso(x + w, y, z, originX, originY, scale),
      iso(x + w, y + d, z, originX, originY, scale),
      iso(x, y + d, z, originX, originY, scale),
      iso(x, y, z + h, originX, originY, scale),
      iso(x + w, y, z + h, originX, originY, scale),
      iso(x + w, y + d, z + h, originX, originY, scale),
      iso(x, y + d, z + h, originX, originY, scale),
    ];

    ctx.fillStyle = color;
    ctx.beginPath();
    [p[4], p[5], p[6], p[7]].forEach((pt, i) => i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y));
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = shade(color, -18);
    ctx.beginPath();
    [p[1], p[2], p[6], p[5]].forEach((pt, i) => i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y));
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = shade(color, -32);
    ctx.beginPath();
    [p[2], p[3], p[7], p[6]].forEach((pt, i) => i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y));
    ctx.closePath();
    ctx.fill();
  }

  function shade(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (n >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (n & 255) + amount));
    return `rgb(${r}, ${g}, ${b})`;
  }

  function drawWarehouse(state, system) {
    const canvas = $("viz-canvas");
    if (!canvas) return;
    const wrap = $("viz-canvas-wrap");
    const rect = wrap.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    $("viz-prompt")?.classList.add("hidden");
    $("viz-interact-hint")?.classList.remove("hidden");

    const originX = rect.width * 0.5;
    const originY = rect.height * 0.18;
    const scale = Math.min(rect.width / (state.length + state.width) * 0.9, rect.height / (state.length + state.width) * 1.5, 2.5);

    const floor = [
      iso(0, 0, 0, originX, originY, scale),
      iso(state.length, 0, 0, originX, originY, scale),
      iso(state.length, state.width, 0, originX, originY, scale),
      iso(0, state.width, 0, originX, originY, scale),
    ];

    ctx.fillStyle = "#252d3e";
    ctx.beginPath();
    floor.forEach((pt, i) => i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.22)";
    ctx.stroke();

    const laneCount = Math.max(3, Math.min(10, Math.floor(state.width / (system.id === "mobile" ? 18 : 28))));
    const rackLength = state.length * 0.72;
    const laneDepth = Math.min(state.width / (laneCount * 1.7), 7 + system.deep * 1.1);
    const startX = state.length * 0.12;
    const startY = state.width * 0.12;
    const gap = (state.width * 0.76 - laneDepth * laneCount) / Math.max(1, laneCount - 1);
    const bays = Math.max(5, Math.min(18, Math.floor(rackLength / 16)));
    const bayW = rackLength / bays;
    const drawLevels = Math.min(state.levels, 5);

    for (let lane = 0; lane < laneCount; lane++) {
      const y = startY + lane * (laneDepth + gap);
      for (let bay = 0; bay < bays; bay++) {
        if ((lane + bay) % 7 === 0 && system.id !== "mobile") continue;
        const x = startX + bay * bayW;
        for (let level = 0; level < drawLevels; level++) {
          drawBox(ctx, x, y, level * 6, bayW * 0.78, laneDepth, 3.6, system.color, originX, originY, scale);
        }
      }
    }

    const selected = lastState?.rows.find((row) => row.id === system.id);
    ctx.fillStyle = "rgba(0,0,0,.55)";
    ctx.fillRect(12, 12, 250, 78);
    ctx.fillStyle = "#fff";
    ctx.font = "700 15px Inter, sans-serif";
    ctx.fillText(system.name, 24, 38);
    ctx.fillStyle = "rgba(255,255,255,.7)";
    ctx.font = "12px Roboto, sans-serif";
    ctx.fillText(`${fmt(selected ? selected.pallets : 0)} estimated pallet positions`, 24, 58);
    ctx.fillText(`${fmt(state.length)} ft x ${fmt(state.width)} ft | ${fmt(state.levels)} beam levels`, 24, 76);
  }

  function downloadReport(data) {
    const selected = data.rows.find((row) => row.id === selectedSystemId) || data.rows[0];
    const lines = [
      "zhengdarack Warehouse Pallet Capacity Report",
      "",
      `Warehouse: ${fmt(data.length)} ft x ${fmt(data.width)} ft`,
      `Clear height: ${fmt(data.height)} ft`,
      `Gross area: ${fmt(data.grossArea)} sq ft`,
      `Rackable area estimate: ${fmt(data.netArea)} sq ft`,
      `Selected system: ${selected.name}`,
      `Selected capacity: ${fmt(selected.pallets)} pallets`,
      "",
      "System,Estimated pallets,Vs current",
      ...data.rows.map((row) => {
        const improvement = row.improvement == null ? "" : `${Math.round(row.improvement)}%`;
        return `"${row.name}",${Math.round(row.pallets)},"${improvement}"`;
      }),
      "",
      "Conceptual planning only. Final layouts require site-specific engineering review.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "warehouse-capacity-report.csv";
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    link.remove();
  }

  function wireReportModal() {
    const modal = $("report-modal");
    const open = $("download-report-btn");
    const close = $("report-modal-close");
    const form = $("report-form");
    const error = $("report-form-error");
    if (!modal || !open || !close || !form) return;

    open.addEventListener("click", () => {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    });
    close.addEventListener("click", () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    });
    modal.addEventListener("click", (event) => {
      if (event.target === modal) close.click();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!lastState) return;
      const email = $("report-email").value.trim();
      if (!email || !email.includes("@")) {
        error.textContent = "Please enter a valid email address.";
        error.classList.remove("hidden");
        return;
      }
      error.classList.add("hidden");
      downloadReport(lastState);
      close.click();
    });
  }

  function init() {
    const form = $("calc-form");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      try {
        clearError();
        lastState = calculate(readInputs());
        selectedSystemId = "selective";
        renderResults(lastState);
        selectSystem(selectedSystemId);
        $("results-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch (error) {
        showError(error.message);
      }
    });

    window.addEventListener("resize", () => {
      if (!lastState) return;
      drawWarehouse(lastState, systems.find((system) => system.id === selectedSystemId) || systems[1]);
    });

    wireReportModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
