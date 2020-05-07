import React from "react";
import { IonContent, IonIcon } from "@ionic/react";
import { checkmark } from "ionicons";

import "./name.scss";

interface { { COMPONENT_NAME } } Props {

}

export const {{ COMPONENT_NAME }}: React.FC < {{ COMPONENT_NAME }}Props > = (props) => {
	return <IonContent><IonIcon icon={checkmark} />Using Ionic!</IonContent>;
}