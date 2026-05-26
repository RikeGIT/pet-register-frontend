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
