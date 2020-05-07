import React from "react";
import {IonContent, IonIcon} from "@ionic/react";
import {checkmark} from "ionicons";

import "./Test.scss";

interface TestProps {

}

export const Test: React.FC<TestProps> = (props) => {
	return <IonContent><IonIcon icon={checkmark} />Using Ionic!</IonContent>;
}