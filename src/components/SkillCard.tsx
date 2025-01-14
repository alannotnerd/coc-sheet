import * as React from "react";
import { Skill } from "../system/skills";
import { Number } from "./controls/Number";
import deepOrange from "@mui/material/colors/deepOrange";

import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Grid,
  IconButton,
  Icon,
  Collapse,
  styled,
} from "@mui/material";
import SuperSkill from "./SuperSkill";

const styles = () => ({
  root: {},
  card: {},
  pointInput: {},
  nonEdit: {
    display: "none",
  },
  Editing: {},
  superSkill: {},
  initialAvatar: {},
  avatar: {
    backgroundColor: deepOrange[500],
  },
  delete: { margin: "0 0 0 auto" },
});

interface Props extends WithStyles<typeof styles> {
  skill: Skill;
  isEditing: boolean;
  edit: (skill: Skill) => void;
  remove: () => void;
}

interface State {}

class SkillCard extends React.Component<Props, State> {
  title() {
    const { tag, label } = this.props.skill;
    const icons = [];

    if (tag !== undefined) {
      let key = 0;
      if (tag.find((x) => x === "modern"))
        icons.push(
          <span key={++key} title="现代">
            <Icon fontSize="inherit">business</Icon>
          </span>
        );

      if (tag.find((x) => x === "irregular"))
        icons.push(
          <span key={++key} title="非常规">
            <Icon fontSize="inherit">star_half</Icon>
          </span>
        );
    }
    return (
      <>
        <span>{label}</span> {icons}
      </>
    );
  }

  edit = (next: Partial<Skill>) => {
    const skill = { ...this.props.skill, ...next };
    this.props.edit(skill);
  };

  private total(): number {
    const { occupation, interest, growth, initial } = this.props.skill;
    let total = 0;
    if (typeof initial === "number") total += initial;
    if (occupation) total += occupation;
    if (interest) total += interest;
    if (growth) total += growth;
    return total;
  }

  private edited(): boolean {
    const { occupation, interest, growth } = this.props.skill;
    const test = (x: any) => x !== undefined && x !== 0;
    return test(occupation) || test(interest) || test(growth);
  }

  private avatar() {
    const total = this.total();
    const className = this.edited() ? "avatar" : "initialAvatar";
    return <Avatar className={className}>{String(total)}</Avatar>;
  }

  render() {
    const { isEditing, skill } = this.props;
    const { name, contains, deletable } = this.props.skill;
    if (contains !== undefined)
      return (
        <SuperSkill
          edit={this.props.edit}
          skill={skill}
          isEditing={isEditing}
        />
      );
    const editFields = (
      <Collapse in={isEditing}>
        <CardContent className="Editing">
          <Grid container spacing={8}>
            <Grid xs={4} item>
              <Number
                margin="none"
                value={skill.occupation}
                onEdited={(occupation) => this.edit({ occupation })}
                fullWidth
                className="pointInput"
                label="职业"
              />
            </Grid>
            <Grid xs={4} item>
              <Number
                margin="none"
                value={skill.interest}
                onEdited={(interest) => this.edit({ interest })}
                fullWidth
                className="pointInput"
                label="兴趣"
              />
            </Grid>
            <Grid xs={4} item>
              <Number
                margin="none"
                value={skill.growth}
                onEdited={(growth) => this.edit({ growth })}
                fullWidth
                className="pointInput"
                label="成长"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Collapse>
    );

    let action = null;
    if (isEditing) {
      if (deletable) {
        action = (
          <IconButton className="delete" onClick={this.props.remove}>
            <Icon>delete_forever</Icon>
          </IconButton>
        );
      }
    } else
      action = (
        <IconButton className="delete">
          <Checkbox />
        </IconButton>
      );
    return (
      <Grid xs={12} sm={6} md={4} lg={3} xl={2} item className="root">
        <Card className="card">
          <CardHeader
            avatar={this.avatar()}
            title={this.title()}
            subheader={name}
            action={action}
          />
          {editFields}
        </Card>
      </Grid>
    );
  }
}

export default styled(SkillCard)(styles);
