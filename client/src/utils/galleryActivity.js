const STORAGE_KEY = 'brito_gallery_activity_v1';

const emptyMonths = () =>
  Array.from({ length: 12 }, () => ({ uploads: 0, updates: 0, deletes: 0 }));

const readLog = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"events":[]}');
    return Array.isArray(parsed.events) ? parsed.events : [];
  } catch {
    return [];
  }
};

export const recordGalleryActivity = (type) => {
  if (!['upload', 'update', 'delete'].includes(type)) return;
  const events = readLog();
  events.push({ type, at: new Date().toISOString() });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ events: events.slice(-400) }));
  } catch {
    /* ignore quota */
  }
};

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const activityYears = (items = []) => {
  const years = new Set([new Date().getFullYear()]);
  items.forEach((item) => {
    const created = parseDate(item.created_at);
    const updated = parseDate(item.updated_at);
    if (created) years.add(created.getFullYear());
    if (updated) years.add(updated.getFullYear());
  });
  readLog().forEach((event) => {
    const date = parseDate(event.at);
    if (date) years.add(date.getFullYear());
  });
  return [...years].sort((a, b) => b - a);
};

export const monthlyGalleryActivity = (items = [], year) => {
  const live = emptyMonths();
  const logged = emptyMonths();

  items.forEach((item) => {
    const created = parseDate(item.created_at);
    const updated = parseDate(item.updated_at);
    if (created && created.getFullYear() === year) {
      live[created.getMonth()].uploads += 1;
    }
    if (updated && updated.getFullYear() === year) {
      const createdTime = created ? created.getTime() : 0;
      if (Math.abs(updated.getTime() - createdTime) > 60 * 1000) {
        live[updated.getMonth()].updates += 1;
      }
    }
  });

  readLog().forEach((event) => {
    const date = parseDate(event.at);
    if (!date || date.getFullYear() !== year) return;
    logged[date.getMonth()][`${event.type}s`] += 1;
  });

  return live.map((row, index) => ({
    uploads: Math.max(row.uploads, logged[index].uploads),
    updates: Math.max(row.updates, logged[index].updates),
    deletes: logged[index].deletes,
  }));
};
