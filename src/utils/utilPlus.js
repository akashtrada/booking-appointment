export function px(value)
{
  return `${value}px`;
}

export const TIME_SLOTS = (() =>
{
  const slots = [];
  for(let h = 9; h < 21; h++)
  {
    for(let m = 0; m < 60; m += 15)
    {
      const period = h < 12 ? "AM" : "PM";
      const dh = h % 12 || 12;
      slots.push({
        value: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
        label: `${String(dh).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`
      });
    }
  }
  return slots;
})();
