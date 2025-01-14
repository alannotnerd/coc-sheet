import * as React from "react";

import { connect } from "react-redux";
import { Sheet } from "../system/sheet";
import { Info, infoRecord, Modified } from "../system/logger";
import { LogRecord } from "../system/logger";
import {
  Icon,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Badge,
  Button,
  TextField,
  Grid,
  styled,
} from "@mui/material";
import { formatDate } from "../utils";
import { Dispatch } from "redux";
import { logger } from "../actions";

const styles = () => ({
  root: {},
  content: {
    paddingRight: "1em",
  },
  logInput: {
    width: "100%",
  },
});

interface Props extends WithStyles<typeof styles> {
  logs: Array<LogRecord>;
  logger: (record: LogRecord) => void;
}

interface State {
  size?: number;
  current: string;
}

const NUM = 20;

class Log extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { size: NUM, current: "" };
  }

  static remark(remarks: Array<string>) {
    const length = remarks.length;
    if (length === 0) return null;
    const max = 8;
    const xs = length > max ? remarks.slice(0, max) : remarks;
    return (
      <span>
        ({xs.join(", ")}
        {length === xs.length ? "" : "…"})
      </span>
    );
  }

  modified(record: Modified) {
    const remark = Log.remark(record.remarks);
    if (record.old === undefined) {
      return (
        <>
          <ListItemIcon>
            <Icon fontSize="inherit">add</Icon>
          </ListItemIcon>
          <ListItemText>
            {record.display} {record.next} {remark}
          </ListItemText>
        </>
      );
    } else {
      const delta = record.next - record.old;
      const diff = delta > 0 ? `+${delta}` : String(delta);
      const content = (
        <span className="content">
          {record.display} {record.old} ({diff}) ⇒ {record.next} {remark}
        </span>
      );
      return (
        <>
          <ListItemIcon>
            <Icon fontSize="inherit">edit</Icon>
          </ListItemIcon>
          <ListItemText>{Log.withBadge(record.count, content)}</ListItemText>
        </>
      );
    }
  }

  static withBadge(count: number, content: JSX.Element) {
    if (count < 2) return content;
    return (
      <Badge badgeContent={count} color="primary">
        {content}
      </Badge>
    );
  }

  info(record: Info) {
    const className = "content";
    return (
      <>
        <ListItemIcon>
          <Icon fontSize="inherit">info</Icon>
        </ListItemIcon>
        <ListItemText>
          {Log.withBadge(
            record.count,
            <span className={className}>{record.message}</span>
          )}
        </ListItemText>
      </>
    );
  }

  dispatch(record: LogRecord) {
    switch (record.type) {
      case "Info":
        return this.info(record);
      case "Modified":
        return this.modified(record);
    }
  }

  logInput = () => {
    const text = this.state.current.trim();
    if (text !== "") {
      this.props.logger(infoRecord(this.state.current));
      this.setState({ current: "" });
    }
  };

  render() {
    const length = this.props.logs.length;
    const currentSize = this.state.size;
    const logs = this.props.logs
      .map((record: LogRecord, index: number) => (
        <ListItem key={index}>
          {this.dispatch(record)}
          <Typography color="textSecondary">
            {formatDate(record.date)}
          </Typography>
        </ListItem>
      ))
      .reverse()
      .slice(0, currentSize);
    return (
      <div>
        <Grid container justify="space-around" alignItems="flex-end">
          <Grid item>
            <TextField
              value={this.state.current}
              label="日志"
              className="logInput"
              placeholder="描述人物的变化"
              onChange={(e) =>
                this.setState({ current: e.currentTarget.value })
              }
              multiline
            />
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={this.logInput}>
              记录
            </Button>
          </Grid>
        </Grid>

        {currentSize ? null : (
          <Button onClick={() => this.setState({ size: NUM })}>
            只显示最近 {NUM} 条
          </Button>
        )}
        <List className="root">{logs}</List>
        {currentSize && length > currentSize ? (
          <Button onClick={() => this.setState({ size: undefined })}>
            显示所有 {length} 条
          </Button>
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = (state: Sheet): Partial<Props> => ({
  logs: state.logs,
});

const mapDispatchToProps = (dispatch: Dispatch): Pick<Props, "logger"> => ({
  logger: (record) => dispatch(logger(record)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(styled(Log)(styles));
