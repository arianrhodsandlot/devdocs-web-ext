import React from 'react'
import {Slider, Typography, Radio, Checkbox, Button, Grid, GridCell, Elevation} from 'rmwc/index.tsx'

const App = () => (
  <>
    <Typography use="subtitle2" tag="h2">SIZE</Typography>
    <Typography use="subtitle2" tag="h3">WIDTH</Typography>
    <Slider
      discrete
      displayMarkers
      min={100}
      max={200}
      step={5}
    />
    <Typography use="subtitle2" tag="h3">HEIGHT</Typography>
    <Slider
      discrete
      displayMarkers
      min={100}
      max={200}
      step={5}
    />

    <Typography use="subtitle2" tag="h3">theme</Typography>
    <Radio
      value="cookies">
      Cookies
    </Radio>
    <Radio
      value="pizza">
      Pizza
    </Radio>

    <Typography use="subtitle2" tag="h3">DOCS</Typography>
    <Checkbox label="Pizza" />

    <Typography use="subtitle2" tag="h3">other</Typography>
    <Button icon="keyboard" outlined dense>hotkey</Button>

    <Elevation style={{textAlign: 'center', marginTop: 20}}>
      <Typography use="caption" tag="h3">DevDocs Web Ext</Typography>
      <Typography use="caption" tag="div">A Chrome Extension for DevDocs.</Typography>
      <Typography use="caption" tag="div">version: 1.10.10 (3dasf4)</Typography>
      <Typography use="caption" tag="div">
        <a href="a">rate</a>
        <span style={{padding: '0 5px'}}>·</span>
        <a href="a">feedback</a>
        <span style={{padding: '0 5px'}}>·</span>
        <a href="a">source</a>
      </Typography>
    </Elevation>
  </>
)

export default App
