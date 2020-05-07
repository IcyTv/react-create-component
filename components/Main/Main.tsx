import React from "react";
import {IonContent, IonIcon} from "@ionic/react";
import {checkmark} from "ionicons";

import "./Main.scss";

interface MainProps {

}

export const Main: React.FC<MainProps> = (props) => {
	return <IonContent><IonIcon icon={checkmark} />Using Ionic!</IonContent>;
}