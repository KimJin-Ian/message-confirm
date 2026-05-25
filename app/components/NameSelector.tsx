"use client";

import { useAuthor } from "./NameContext";

export default function NameSelector() {
  const { name, setName, knownNames, addKnownName } = useAuthor();

  const handleChange = (value: string) => {
    if (value === "__custom") {
      const entered = prompt("이름을 입력해주세요:", "");
      if (entered && entered.trim()) {
        const clean = entered.trim();
        addKnownName(clean);
        setName(clean);
      }
      return;
    }
    setName(value);
  };

  return (
    <div className="name-selector">
      <span className="label">이름</span>
      <select
        value={knownNames.includes(name) || name === "" ? name : name}
        onChange={(e) => handleChange(e.target.value)}
        aria-label="작성자 이름 선택"
      >
        <option value="">익명</option>
        {knownNames.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
        <option value="__custom">직접 입력…</option>
      </select>
    </div>
  );
}
