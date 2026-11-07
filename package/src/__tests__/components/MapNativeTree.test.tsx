import { Map } from "@maplibre/maplibre-react-native";
import { fireEvent, render } from "@testing-library/react-native";
import { View } from "react-native";

// The snapshot was recorded before map engines existed. A map with no engine
// prop and no MapEngineProvider must keep rendering exactly this host tree.
describe("Map without an engine", () => {
  test("renders the same host tree as before engines", async () => {
    const result = await render(
      <Map
        mapStyle="https://demotiles.maplibre.org/style.json"
        testID="mlrn-map"
      >
        <View testID="child" />
      </Map>,
    );

    expect(result.toJSON()).toMatchSnapshot("before layout");

    await fireEvent(result.getByTestId("mlrn-map-view"), "layout");

    expect(result.toJSON()).toMatchSnapshot("after layout");
  });
});
