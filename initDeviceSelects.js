const option = (id, label) => {
  const o = document.createElement("option");
  o.value = id;
  o.textContent = label;
  return o;
};

const getOrCreateSelect = (parent, sels, grp, addlabel = true) => {
  const sel = sels[grp];
  if (sel) return sel;
  if (addlabel) {
    const label = document.createElement("div");
    label.textContent = grp;
    parent.appendChild(label);
  }
  const s = document.createElement("select");
  parent.appendChild(s);
  sels[grp] = s;
  return s;
};

export const initDeviceSelects = async (selkinds, filter = null) => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const sels = {};
  for (const device of devices) {
    if (filter && filter != device.kind) continue;
    const sel = getOrCreateSelect(selkinds, sels, device.kind, filter == null);
    sel.appendChild(option(device.deviceId, device.label));
  }
  return sels;
};
