import * as React from "react";
import Note from "./Note";
import InformationForm from "./InformationForm";
import Attributes from "./AttributesForm";
import Log from "./Log";
import { Grid, styled } from "@mui/material";
import Occupations from "./OccupationForm";
import BackstoryForm from "./BackstoryForm";
import Skills from "./Skills";

const Sheet = () => {
  return (
    <Grid className={"root"} container>
      <Grid item md={8} lg={9} xl={10}>
        <InformationForm />
        <Attributes />
        <Occupations />
        <Skills />
        <BackstoryForm />
        <Note />
      </Grid>
      <Grid item md={4} lg={3} xl={2}>
        <Log />
      </Grid>
    </Grid>
  );
};

export default styled(Sheet)(({ theme }) => ({
  root: {
    padding: theme.spacing(2),
  },
}));
