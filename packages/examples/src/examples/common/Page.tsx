import { useNavigation, useRoute } from "@react-navigation/native";
import React, { ReactElement, ReactNode } from "react";
import { View } from "react-native";

import MapHeader from "./MapHeader";
import colors from "../../styles/colors";
import sheet from "../../styles/sheet";

interface PageProps {
  children: ReactNode;
}

const Page = ({ children }: PageProps): ReactElement => {
  const navigation = useNavigation();
  const route = useRoute();
  const label = route.name;

  return (
    <View style={sheet.matchParent}>
      <MapHeader
        backgroundColor={colors.primary.pink}
        statusBarColor={colors.primary.pinkDark}
        statusBarTextTheme="light-content"
        label={label}
        onBack={(): void => navigation.goBack()}
      />
      {children}
    </View>
  );
};

export default Page;
