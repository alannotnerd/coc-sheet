import * as React from "react";

import { Dispatch } from "redux";
import { connect } from "react-redux";
import { Sheet } from "../system/sheet";
import { Number, Props as NumberProps } from "./controls/Number";
import {
  ATTRIBUTES,
  Attributes,
  autoAttributes,
  characteristicsSum,
  computeDbBuild,
  computeHp,
  computeMov,
  computeMp,
  enhance,
  rollLuck,
} from "../system/stats";
import { editAttribute, logger } from "../actions";
import {
  Button,
  Chip,
  createStyles,
  Grid,
  Icon,
  IconButton,
  InputAdornment,
  Theme,
  Typography,
  styled,
} from "@mui/material";
import { infoRecord, LogRecord, modifiedRecord } from "../system/logger";
import { ageAffect, ageHint, randomAge } from "../system/age";

const styles = ({ theme: { spacing } }: { theme: Theme }) => ({
  point: {},
  statsChip: {
    margin: spacing(1),
  },
  characteristics: {},
  sum: {
    padding: spacing(1),
  },
});

interface Props extends WithStyles<typeof styles> {
  attributes: Partial<Attributes>;
  logger: (record: LogRecord) => void;
  onEdited: (next: Partial<Attributes>) => void;
}

interface State {}

export class AttributesForm extends React.Component<Props, State> {
  generate() {
    const age = this.props.attributes.age;
    let isYoung = false;
    if (age !== undefined) {
      const affect = ageAffect(age);
      isYoung = affect.type === "Young";
    }
    let [luck, discardLuck] = rollLuck(isYoung);
    const next: Partial<Attributes> = { ...autoAttributes(), luck };
    this.props.onEdited(next);
    let info = `随机生成了属性点, 合计 ${characteristicsSum(next)} 点`;
    if (isYoung) {
      info += `, 幸运已根据年龄调整：取 ${luck} 和 ${discardLuck} 中较大值`;
    }

    this.props.logger(infoRecord(info, "GENERATE_ATTRIBUTES"));
  }

  changeAge = (age: number = randomAge()) => {
    const hint = ageHint(age);
    if (hint) this.props.logger(infoRecord(`年龄 ${age}：${hint}`, "EDIT_AGE"));
    this.props.onEdited({ age });
  };

  modifyAttribute = (
    key: keyof Attributes,
    next: number,
    message?: string,
    log_key?: string
  ) => {
    const display = ATTRIBUTES[key];
    const old = this.props.attributes[key];
    const record = modifiedRecord(
      log_key ? log_key : key,
      display,
      next,
      old,
      message
    );
    this.props.logger(record);
    this.props.onEdited({ [key]: next });
  };

  doEduEnhance = () => {
    const edu = this.props.attributes.edu;
    if (edu === undefined) return;
    const { check, attr: newEdu } = enhance(edu);
    let info = `增强检定 1d100: ${check} `;
    if (newEdu > edu) {
      info += `成功`;
    } else info += "失败";
    this.modifyAttribute("edu", newEdu, info);
  };

  doLuckEnhance = () => {
    const luck = this.props.attributes.luck;
    if (luck === undefined) return;
    const { check, attr: newLuck } = enhance(luck);
    let info = `增强检定 1d100: ${check} `;
    if (newLuck > luck) {
      info += `成功`;
    } else info += "失败";
    this.modifyAttribute("luck", newLuck, info);
  };

  fillNumberProps = (
    key: keyof Attributes,
    initial?: number,
    after?: number
  ): Partial<NumberProps> => {
    const className = "point";
    const display = ATTRIBUTES[key];
    const onEdited = (value: number) => this.modifyAttribute(key, value);
    const attr = this.props.attributes[key];
    const value = attr === undefined ? initial : attr;
    let endAdornment = undefined;
    if (after !== undefined)
      endAdornment = (
        <InputAdornment position="end">{`/${after}`}</InputAdornment>
      );
    return {
      label: display,
      value,
      InputProps: { endAdornment },
      className: className,
      placeholder: key.toUpperCase(),
      onClick: () => {
        if (attr === undefined && value !== undefined) onEdited(value);
      },
      onEdited,
    };
  };

  render() {
    const pointClass = "point";
    const chipClass = "statsChip";
    const name = this.fillNumberProps;

    const { age, edu, dex, luck, str, con, siz, pow } = this.props.attributes;
    let db = null;
    let build = null;
    if (str && siz) {
      const result = computeDbBuild({ str, siz });
      if (result) {
        db = <Chip className={chipClass} label={`伤害加深 ${result.db}`} />;
        build = <Chip className={chipClass} label={`体格 ${result.build}`} />;
      }
    }
    const mov =
      age && dex && str && siz ? (
        <Chip
          className={chipClass}
          label={`移动力 ${computeMov({ age, dex, str, siz })}`}
        />
      ) : null;
    const hpMax = con && siz ? computeHp({ con, siz }) : undefined;
    const mpMax = pow ? computeMp(pow) : undefined;
    const sanMax = 99; // TODO: 99 - Cthulhu Mythos

    const buttons = (
      <Grid container spacing={8}>
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.generate()}
          >
            <Icon>casino</Icon> 随机属性
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={this.doEduEnhance}
            disabled={edu === undefined}
          >
            教育增强
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            disabled={luck === undefined}
            onClick={this.doLuckEnhance}
          >
            幸运增强
          </Button>
        </Grid>
      </Grid>
    );

    const sum = characteristicsSum(this.props.attributes);
    const sumText = sum ? (
      <Typography variant="caption" className="sum">
        幸运除外合计 {sum}
      </Typography>
    ) : null;

    const characteristics = (
      <Grid container spacing={8} className="characteristics">
        <Grid item>
          <Number {...name("str")} max={99} />
        </Grid>
        <Grid item>
          <Number {...name("con")} max={99} />
        </Grid>
        <Grid item>
          <Number {...name("siz")} />
        </Grid>
        <Grid item>
          <Number {...name("dex")} max={99} />
        </Grid>
        <Grid item>
          <Number {...name("app")} max={99} />
        </Grid>
        <Grid item>
          <Number {...name("int")} max={99} />
        </Grid>
        <Grid item>
          <Number {...name("pow")} />
        </Grid>
        <Grid item>
          <Number {...name("edu")} max={99} />
        </Grid>
        <Grid item>
          <Number {...name("luck")} />
        </Grid>
        {sumText}
      </Grid>
    );

    const stats = (
      <Grid container>
        <Grid item container spacing={8}>
          <Grid item>
            <Number {...name("hp", hpMax, hpMax)} max={hpMax} />
          </Grid>
          <Grid item>
            <Number {...name("mp", mpMax, mpMax)} max={mpMax} />
          </Grid>
          <Grid item>
            <Number {...name("san", pow, sanMax)} max={sanMax} />
          </Grid>
          <Grid item>
            <Number {...name("armor")} />
          </Grid>
        </Grid>
        <Grid item>
          {db}
          {build}
          {mov}
        </Grid>
      </Grid>
    );

    return (
      <div>
        <Grid container spacing={16}>
          <Grid item container alignItems="flex-end" spacing={8}>
            <Grid item>
              <Number
                label="年龄"
                className={pointClass}
                value={age}
                onEdited={this.changeAge}
              />
            </Grid>
            <Grid item>
              <IconButton onClick={() => this.changeAge()}>
                <Icon>casino</Icon>
              </IconButton>
            </Grid>
          </Grid>
          <Grid item>
            {characteristics}
            {buttons}
            {stats}
          </Grid>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state: Sheet) => ({ attributes: state.stats });

const mapDispatchToProps = (
  dispatch: Dispatch
): Pick<Props, "onEdited" | "logger"> => ({
  onEdited: (next) => dispatch(editAttribute(next)),
  logger: (record) => dispatch(logger(record)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(styled(AttributesForm)(styles));
