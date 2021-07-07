const typeConverter: (string: string) => string | number | boolean = (string) => {
  if (string === "true" || string === "false") {
    return string === "true";
  }
  const regEx = new RegExp(/^[0-9]*$/);
  if (regEx.test(string)) {
    return +string;
  }

  return string;
};

export default typeConverter;
