// Only react-native-app installs @maplibre/native-ffi-react-native, and other
// apps get Metro's stub (see metro.shared.js), so this workspace sees it as
// untyped.
declare module "@maplibre/native-ffi-react-native";
