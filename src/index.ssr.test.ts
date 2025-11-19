import { FingerprintService } from "./index";
import * as environment from "./utils/environment";

describe("FingerprintService SSR compatibility", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("generates a fingerprint without DOM globals", async () => {
    jest.spyOn(environment, "getGlobalWindow").mockReturnValue(null);
    jest.spyOn(environment, "getDocument").mockReturnValue(null);
    jest.spyOn(environment, "getNavigator").mockReturnValue(null);
    jest.spyOn(environment, "getLocalStorage").mockReturnValue(null);

    const service = new FingerprintService();
    const fingerprint = await service.generateFingerprint();

    expect(typeof fingerprint).toBe("string");
    expect(fingerprint.length).toBeGreaterThan(0);
  });
});
