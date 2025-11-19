import { FingerprintService } from "./index";

const mockFingerprintData = (name: string) => ({
  getFingerprintData: jest.fn().mockResolvedValue({
    characteristics: { [name]: `${name}_data` },
    strength: { score: 1, details: [`${name} detail`] },
  }),
});

let CanvasFingerprintMock: jest.Mock;
let StableFingerprintMock: jest.Mock;

jest.mock("./services/CanvasFingerprint", () => {
  CanvasFingerprintMock = jest.fn().mockImplementation(() =>
    mockFingerprintData("canvas")
  );

  return {
    CanvasFingerprint: CanvasFingerprintMock,
  };
});

jest.mock("./services/StableFingerprint", () => {
  StableFingerprintMock = jest.fn().mockImplementation(() =>
    mockFingerprintData("stable")
  );

  return {
    StableFingerprint: StableFingerprintMock,
  };
});

describe("FingerprintService fingerprinter selection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const baseOptions = {
    battery: false,
    screen: false,
    behavior: false,
  };

  it("initializes canvas fingerprinting by default", async () => {
    const service = new FingerprintService(baseOptions);
    await service.getDetailedFingerprint();
    expect(CanvasFingerprintMock).toHaveBeenCalledTimes(1);
  });

  it("disables canvas fingerprinting when requested", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const service = new FingerprintService({ ...baseOptions, canvas: false });
    expect(CanvasFingerprintMock).not.toHaveBeenCalled();
  });

  it("initializes stable fingerprinting by default", async () => {
    const service = new FingerprintService(baseOptions);
    await service.getDetailedFingerprint();
    expect(StableFingerprintMock).toHaveBeenCalledTimes(1);
  });

  it("disables stable fingerprinting when requested", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const service = new FingerprintService({ ...baseOptions, stable: false });
    expect(StableFingerprintMock).not.toHaveBeenCalled();
  });
});
