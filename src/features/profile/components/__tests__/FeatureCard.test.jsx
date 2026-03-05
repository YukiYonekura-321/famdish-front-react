import React from "react";
import { render, screen } from "@testing-library/react";
import { FeatureCard } from "../FeatureCard";

describe("FeatureCard", () => {
  it("アイコン・タイトル・説明を表示する", () => {
    render(
      <FeatureCard
        icon="🍽️"
        title="献立提案"
        desc="AIが献立を提案します"
        bg="bg-white"
        border="border-gray-200"
      />,
    );
    expect(screen.getByText("🍽️")).toBeInTheDocument();
    expect(screen.getByText("献立提案")).toBeInTheDocument();
    expect(screen.getByText("AIが献立を提案します")).toBeInTheDocument();
  });

  it("bg と border クラスが適用される", () => {
    const { container } = render(
      <FeatureCard
        icon="📋"
        title="T"
        desc="D"
        bg="bg-blue-50"
        border="border-blue-200"
      />,
    );
    expect(container.firstChild).toHaveClass("bg-blue-50");
    expect(container.firstChild).toHaveClass("border-blue-200");
  });
});
