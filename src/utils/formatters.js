function onlyDigits(value) {
  return String(value ?? "").replace(/\D/g, "")
}

export function formatCpf(value) {
  const digits = onlyDigits(value).slice(0, 11)
  const firstPart = digits.slice(0, 3)
  const secondPart = digits.slice(3, 6)
  const thirdPart = digits.slice(6, 9)
  const fourthPart = digits.slice(9, 11)

  let formatted = firstPart

  if (digits.length > 3) {
    formatted += `.${secondPart}`
  }

  if (digits.length > 6) {
    formatted += `.${thirdPart}`
  }

  if (digits.length > 9) {
    formatted += `-${fourthPart}`
  }

  return formatted
}

export function formatPhone(value) {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 10) {
    const areaCode = digits.slice(0, 2)
    const firstPart = digits.slice(2, 6)
    const secondPart = digits.slice(6, 10)

    if (!areaCode) {
      return digits
    }

    return secondPart
      ? `(${areaCode}) ${firstPart}-${secondPart}`
      : firstPart
        ? `(${areaCode}) ${firstPart}`
        : `(${areaCode}`
  }

  const areaCode = digits.slice(0, 2)
  const firstPart = digits.slice(2, 7)
  const secondPart = digits.slice(7, 11)

  return secondPart
    ? `(${areaCode}) ${firstPart}-${secondPart}`
    : firstPart
      ? `(${areaCode}) ${firstPart}`
      : `(${areaCode}`
}

export function computeAgeFromDate(dateString) {
  if (!dateString) return null;

  const birth = new Date(dateString);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

export function formatAgeDisplay({ idade, dataNascimento }) {
  // Prefer a precise value when we have a birth date
  if (dataNascimento) {
    const birth = new Date(dataNascimento);
    if (!Number.isNaN(birth.getTime())) {
      const today = new Date();
      let years = today.getFullYear() - birth.getFullYear();
      let months = today.getMonth() - birth.getMonth();
      const days = today.getDate() - birth.getDate();

      if (days < 0) months -= 1;
      if (months < 0) {
        years -= 1;
        months += 12;
      }

      if (years > 0) return years === 1 ? "1 ano" : `${years} anos`;
      if (months > 0) return months === 1 ? "1 mês" : `${months} meses`;
      return "Menos de 1 mês";
    }
  }

  // Fallback to integer years when birth date is not available
  if (idade === null || idade === undefined || idade === "")
    return "Idade não informada";

  const numericAge = Number(idade);
  if (Number.isNaN(numericAge)) return String(idade);

  return numericAge === 1 ? "1 ano" : `${numericAge} anos`;
}
