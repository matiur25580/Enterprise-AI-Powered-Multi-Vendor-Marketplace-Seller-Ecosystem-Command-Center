module.exports = (role, fullName, dob) => {
  const X = role[0].toUpperCase();
  const p = fullName.trim().split(/\s+/); const Y = (p[0]?.[0]||'X').toUpperCase(); const Z = (p[1]?.[0]||'X').toUpperCase();
  const d = dob.replace(/\D/g,''); const DD=d.slice(0,2), MM=d.slice(2,4), YYYY=d.slice(4,8);
  return `${X}${Y}${Z}${DD}${MM}${YYYY}`;
};
