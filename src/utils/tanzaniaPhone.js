export function getTanzaniaNationalNumber(value = "") {
  let digits = String(value).replace(/\D/g, "");
  if (digits.startsWith("255")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 9);
}

export function toTanzaniaPhoneNumber(value = "") {
  const national = getTanzaniaNationalNumber(value);
  return national ? `255${national}` : "";
}
