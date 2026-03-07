import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QRCodeSection } from "../QRCodeSection";

// QRCodeCanvas モック
jest.mock("qrcode.react", () => ({
  QRCodeCanvas: function MockQR(props) {
    return <canvas data-testid="qr-canvas" data-value={props.value} />;
  },
}));

describe("QRCodeSection", () => {
  const defaultProps = {
    inviteUrl: "https://example.com/invite/abc",
    qrCodeRef: { current: null },
    onDownload: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("「QRコード」見出しを表示する", () => {
    render(<QRCodeSection {...defaultProps} />);
    expect(screen.getByText("QRコード")).toBeInTheDocument();
  });

  it("QR キャンバスを描画する", () => {
    render(<QRCodeSection {...defaultProps} />);
    expect(screen.getByTestId("qr-canvas")).toBeInTheDocument();
  });

  it("ダウンロードボタンで onDownload が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<QRCodeSection {...defaultProps} />);
    await user.click(screen.getByText("QRコードをダウンロード"));
    expect(defaultProps.onDownload).toHaveBeenCalledTimes(1);
  });
});
