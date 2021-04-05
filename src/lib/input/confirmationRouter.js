/* eslint react-hooks/exhaustive-deps: "off" */
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useLayout } from "../../store/layout";
import i18n from "i18next"


export function useConfirmationRouter( callbackChanged, props) {

	const history = useHistory()
	const { dialogOpen } = useLayout()

	useEffect(() => {
		let unblock = history.block((location)=>{
			if ( location.hash?.length>0 ) return true
			if ( callbackChanged() ) {
				(async ()=>{
					if ( await dialogOpen({
						type: "warning",
						title: i18n.t("pag.default.dlg.router_confirm.title"),
						text: i18n.t("pag.default.dlg.router_confirm.text"),
						labelOk: i18n.t("pag.default.dlg.router_confirm.labelOk"),
						labelCancel: i18n.t("pag.default.dlg.router_confirm.labelCancel"),
					})) {
						unblock()
						console.log(location)
						history.push(location)
					}
				})()
				return false
			}
			unblock()
			return true
		});
		return unblock
	}, props)
	
}