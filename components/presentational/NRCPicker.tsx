import { fetcher } from "@/util/fetcher";
import { verifyNRC } from "@/util/verify";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React from "react";
import useSWR from "swr";
import SelectBox, { SelectType } from "./SelectBox";
import { convertMM } from "@/util/textHelper";
import ErrorText from "./ErrorText";

interface Props {
  isVerify: boolean;
  nrcState: string;
  nrcTownship: string;
  nrcType: string;
  nrcNumber: string;
  setNrc: Function;
  disabled: boolean;
}

function NRCPicker({
  isVerify,
  nrcState,
  nrcTownship,
  nrcType,
  nrcNumber: parentNrcNumber,
  setNrc,
  disabled,
}: Props) {
  const { t } = useTranslation("account");
  const [nrcError, setNrcError] = React.useState("");
  const [nrcErrorMM, setNrcErrorMM] = React.useState("");
  const { data } = useSWR("/api/nrc", fetcher);
  const [stateList, setStateList] = React.useState<SelectType[]>([]);
  const [currentState, setCurrentState] = React.useState<SelectType>();
  const [currentTownship, setCurrentTownship] = React.useState<SelectType>();
  const [townshipList, setTownshipList] = React.useState<SelectType[]>([]);
  const typeList: SelectType[] = [
    { nameMM: "နိုင်", name: "Naing", value: "Naing" },
    { nameMM: "ဧည့်", name: "Ae", value: "Ae" },
    { nameMM: "ပြု", name: "Pyu", value: "Pyu" },
    { nameMM: "စ", name: "Sa", value: "Sa" },
    { nameMM: "သ", name: "Tha", value: "Tha" },
    { nameMM: "သီ", name: "Thi", value: "Thi" },
  ];
  let a = nrcType ? typeList.filter((e) => e.value === nrcType) : typeList;

  const [currentType, setCurrentType] = React.useState<SelectType>(
    a ? a[0] : typeList[0]
  );

  const [nrcVerify, setNrcVerify] = React.useState(isVerify);
  const [nrcNumber, setNrcNumber] = React.useState(parentNrcNumber);

  /*
  နိုင်ငံသား
  ဧည့်နိုင်ငံသား
  နိုင်ငံသားခွင့်ပြုရသူ
  နိုင်ငံသားစိစစ်ခံ
  သာသနာ၀င်
  သာသနာနွယ်၀င်
  */

  React.useEffect(() => {
    if (data) {
      setStateList(
        data.map((elem: any) => {
          return {
            name: elem.states + "/",
            nameMM: convertMM(elem.states) + "/",
            value: elem.states,
          };
        })
      );
      if (nrcState) {
        let s = data
          .filter((e: any) => e.states === nrcState)
          .map((elem: any) => {
            return {
              name: elem.states + "/",
              nameMM: convertMM(elem.states) + "/",
              value: elem.states,
            };
          });
        if (s) {
          setCurrentState(s[0]);
        } else {
          setCurrentState({
            name: data[0].states + "/",
            nameMM: convertMM(data[0].states) + "/",
            value: data[0].states,
          });
        }
      } else {
        setCurrentState({
          name: data[0].states + "/",
          nameMM: convertMM(data[0].states) + "/",
          value: data[0].states,
        });
      }
    }
  }, [data, nrcState]);

  React.useEffect(() => {
    if (data && currentState && currentState.value) {
      let township = data.find(
        (e: any) => e.states === currentState.value
      ).data;
      setTownshipList(
        township.map((elem: any) => {
          return {
            nameMM: elem.name_mm,
            name: elem.name,
            value: elem.name,
          };
        })
      );
      if (nrcTownship) {
        let t = township
          .filter((e: any) => e.name === nrcTownship)
          .map((elem: any) => {
            return {
              nameMM: elem.name_mm,
              name: elem.name,
              value: elem.name,
            };
          });
        if (t) {
          setCurrentTownship(t[0]);
        } else {
          setCurrentTownship(undefined);
        }
      } else {
        setCurrentTownship(undefined);
      }
    }
  }, [data, currentState, nrcTownship]);

  React.useEffect(() => {
    let verify = verifyNRC(nrcNumber);
    if (currentState && currentTownship && currentType && verify.isSuccess) {
      fetch(
        "/api/user?nrc=" +
          encodeURIComponent(
            currentState.value +
              "/" +
              currentTownship.value +
              "(" +
              currentType.value +
              ")" +
              nrcNumber
          )
      ).then((data) => {
        if (data.status === 200) {
          setNrcVerify(false);
          setNrcError("User already exists with this nrc.");
          setNrcErrorMM("ဤမှတ်ပုံတင်တွင် အသုံးပြုသူရှိနှင့်ပြီးဖြစ်သည်။");
          setNrc(
            false,
            currentState.value,
            currentTownship.value,
            currentType.value,
            nrcNumber
          );
        } else {
          setNrc(
            true,
            currentState.value,
            currentTownship.value,
            currentType.value,
            nrcNumber
          );
          setNrcError("");
          setNrcErrorMM("");
          setNrcVerify(true);
        }
      });
    } else {
      setNrcError("Please input valid NRC.");
      setNrcErrorMM("ကျေးဇူးပြု၍ မှတ်ပုံတင်နံပါတ် မှန်မှန်ကန်ကန် ထည့်သွင်းပါ။");
    }
  }, [currentState, currentTownship, currentType, nrcNumber]);

  if (data) {
    return (
      <div className="flex flex-col space-y-3">
        <label
          htmlFor="countries"
          className="text-sm text-darkShade/50 dark:text-white/50"
        >
          {t("nrc")}
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          <SelectBox
            list={stateList}
            selected={currentState}
            setSelected={setCurrentState}
            isSearch={true}
            disabled={disabled}
          />
          <SelectBox
            list={townshipList}
            selected={currentTownship}
            setSelected={setCurrentTownship}
            isSearch={true}
            disabled={disabled}
          />
          <SelectBox
            list={typeList}
            selected={currentType}
            setSelected={setCurrentType}
            isSearch={true}
            disabled={disabled}
          />
          <input
            autoComplete="off"
            type="text"
            className="block py-2.5 px-0 w-[100px] text-sm text-darkShade bg-transparent border-0 border-b-2 border-inputLightBorder appearance-none dark:text-white dark:border-inputDarkBorder dark:focus:border-white focus:outline-none focus:ring-0 focus:border-brand peer"
            placeholder=" "
            disabled={disabled}
            defaultValue={nrcNumber}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              setNrcNumber(e.currentTarget.value);
              let verify = verifyNRC(e.currentTarget.value);
              if (verify.isSuccess) {
                setNrcError("");
                setNrcErrorMM("");
              } else {
                setNrcError(verify.error!);
                setNrcErrorMM(verify.errorMM!);
              }
            }}
          />
          {nrcVerify ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-success"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-danger"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <ErrorText error={nrcError} errorMM={nrcErrorMM} />
      </div>
    );
  } else {
    return (
      <div className="flex justify-between items-center">
        <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24"></div>
        <div className="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
        <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"></div>
      </div>
    );
  }
}

export default NRCPicker;
