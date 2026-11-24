import { describe, it, expect, vi, afterEach } from "vitest";
import {
  createRequest,
  getRequestInterval,
  selectRequestPath,
} from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/service-mesh/request-generation";
import { generateRequestPayload } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/service-mesh/request-payload";
import { INITIAL_SERVICES } from "@/app/[locale]/(main)/tech-mastry/system-design/distributed/_components/service-mesh/data";

function seed(start = 42) {
  let s = start;
  return vi.spyOn(Math, "random").mockImplementation(() => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  });
}

afterEach(() => vi.restoreAllMocks());

describe("service mesh request generation", () => {
  it("maps scenarios to request intervals", () => {
    expect(getRequestInterval("normal")).toBe(1000);
    expect(getRequestInterval("high-load")).toBe(300);
    expect(getRequestInterval("failure")).toBe(800);
  });

  it("builds payloads per target service and method", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(generateRequestPayload("POST", "auth")).toEqual({
      username: "user500",
      password: "********",
      rememberMe: false,
    });
    expect(generateRequestPayload("GET", "auth")).toMatchObject({ expiresIn: 3600 });
    expect(generateRequestPayload("GET", "users")).toEqual({ userId: "usr-5000", includeOrders: false });
    expect(generateRequestPayload("PUT", "users")).toEqual({
      userId: "usr-5000",
      fields: ["name", "email", "preferences"],
    });
    expect(generateRequestPayload("GET", "products")).toEqual({
      category: "books",
      limit: 35,
      sort: "popularity",
    });
    expect(generateRequestPayload("DELETE", "products")).toMatchObject({ productId: "prod-5000" });
    expect(generateRequestPayload("GET", "orders")).toMatchObject({ status: "shipped", limit: 10 });
    expect(generateRequestPayload("POST", "orders")).toMatchObject({
      paymentMethod: "paypal",
      shippingAddress: { zipCode: "55000" },
    });
    expect(generateRequestPayload("PATCH", "orders")).toEqual({ orderId: "ord-5000", status: "shipped" });
    expect(Object.keys(generateRequestPayload("GET", "other"))).toEqual(["timestamp", "requestId"]);
  });

  it("selects mesh specific request paths deterministically", () => {
    seed();
    const picks = (["istio", "linkerd", "consul", "app-mesh"] as const).map((mesh) =>
      Array.from({ length: 6 }, () => selectRequestPath(mesh, "normal", "traffic")),
    );
    expect(picks).toMatchSnapshot();
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    expect(selectRequestPath("istio", "normal", "traffic")).toEqual({
      source: "frontend",
      target: "products",
      canary: true,
    });
    expect(selectRequestPath("istio", "failure", "traffic")).not.toHaveProperty("canary");
  });

  it("creates a request travelling service -> proxy -> proxy -> service", () => {
    seed(7);
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
    const [frontend, auth] = INITIAL_SERVICES;
    const proxy = (s: typeof frontend) => ({
      id: `${s.id}-proxy`,
      serviceId: s.id,
      position: { x: s.position.x + 40, y: s.position.y },
    });
    const request = createRequest({
      id: 9,
      requestPath: { source: "frontend", target: "auth" },
      sourceService: frontend,
      targetService: auth,
      sourceProxy: proxy(frontend),
      targetProxy: proxy(auth),
      activeFeature: "security",
      serviceMeshType: "istio",
    });
    expect(request.id).toBe(9);
    expect(request.method).toBe("POST");
    expect(request.path).toEqual([
      frontend.position,
      { x: 190, y: 150 },
      { x: 440, y: 100 },
      auth.position,
    ]);
    expect(request).toMatchSnapshot();
  });
});
