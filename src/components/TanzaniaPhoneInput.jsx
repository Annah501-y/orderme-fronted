import React from "react";
import { getTanzaniaNationalNumber } from "../utils/tanzaniaPhone";
import "../components_styles/tanzania-phone-input.css";

export default function TanzaniaPhoneInput({
  id,
  name = "phone",
  value = "",
  onChange,
  className = "form-control",
  placeholder = "6XXXXXXXX or 7XXXXXXXX",
  ...props
}) {
  return (
    <div className="tanzania-phone-input">
      <span className="tanzania-phone-input-prefix" aria-hidden="true">+255</span>
      <input
        {...props}
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        pattern="[67][0-9]{8}"
        maxLength={9}
        autoComplete="tel-national"
        className={`tanzania-phone-input-control ${className}`}
        value={getTanzaniaNationalNumber(value)}
        onChange={(event) => {
          const national = getTanzaniaNationalNumber(event.target.value);
          onChange?.({ target: { name, value: national } });
        }}
        placeholder={placeholder}
      />
    </div>
  );
}
