import React from 'react';
import MaterialTable from 'material-table'

import { classes, ranks, roles } from './Constants.js'
import { updatePlayer } from './Api.js'

function arrayToObj(arr) {
  var obj = {}
  for (const item of arr) {
    obj[item] = item;
  }
  return obj;
}

export function PlayerTable(props) {
  const fullEditable = props.loggedInPlayer && props.loggedInPlayer.permission_level >= 2 ? 'always' : 'never';
  const rowEditable = rowData => (props.loggedInPlayer
                                  ? (rowData.id === props.loggedInPlayer.id || props.loggedInPlayer.permission_level >= 2)
                                  : false);
  const defaultFilter = ranks.filter(name => name !== 'Inactive');

  return (
    <MaterialTable
      columns={[
        { title: 'Name', field: 'name', filtering: false, defaultSort: 'asc', editable: fullEditable },
        { title: 'Class', field: 'class', lookup: arrayToObj(classes), editable: fullEditable },
        { title: 'Rank', field: 'rank', defaultFilter: defaultFilter, lookup: arrayToObj(ranks), editable: fullEditable },
        { title: 'Role', field: 'role', lookup: arrayToObj(roles) },
        { title: 'Notes', field: 'notes', filtering: false },
      ]}
      data={ props.players }
      title="Players"
      options={ { paging: false, filtering: true } }
      editable={ {
        isEditable: rowEditable,
        isEditHidden: rowData => !rowEditable(rowData),
        onRowUpdate: (newData, oldData) => {
          return new Promise((resolve, reject) => {
            updatePlayer(newData, props.updateRemoteData);  // API Call
            resolve();
          });
        },
      } }
      detailPanel={ rowData =>
        <PlayerDetailPanelTable rowData={rowData} items={props.items} editable={rowEditable(rowData)}
                                fullEditable={fullEditable} updateRemoteData={props.updateRemoteData}/>
      }
      onRowClick={ (event, rowData, togglePanel) => togglePanel() }
    />
  );
}

function PlayerDetailPanelTable(props) {
  var wishlistData = {'name': 'Wishlist'}
  for (const item of props.rowData.wishlist) {
    wishlistData[item.prio] = props.items.find(x => x.id === item.item_id).name;
  }

  return (
    <MaterialTable
      columns={[
        {title: '', field: 'name', editable: 'never', cellStyle: {'font-weight': '500'}},
        {title: 'First', field: '1'},
        {title: 'Second', field: '2'},
        {title: 'Third', field: '3'},
        {title: 'Fourth', field: '4'},
        {title: 'Fifth', field: '5'},
        {title: 'Sixth', field: '6'},
        {title: 'Seventh', field: '7'},
        {title: 'Eighth', field: '8'},
        {title: 'Ninth', field: '9'},
        {title: 'Tenth', field: '10'},
      ]}
      data={[wishlistData]}
      options={ { paging: false, showTitle: false, toolbar: false } }
    />
  );
}

export function ItemTable(props) {
  var raidShortNameLookup = {};
  for (const raid of props.raids) {
    raidShortNameLookup[raid.id] = raid.short_name;
  }

  return (
    <MaterialTable
      columns={[
        { title: 'Name', field: 'name', defaultSort: 'asc' },
        { title: 'Type', field: 'type' },
        { title: 'Raid', field: 'raid', lookup: raidShortNameLookup },
        { title: 'Bosses', field: 'bosses', render: ((rowData) => {
          return rowData.bosses.reduce((all, cur) => [
            ...all,
            <br />,
            cur,
          ]);
        }) },
        { title: 'Tier', field: 'tier', type: 'numeric' },
        { title: 'Notes', field: 'notes', filtering: false },
      ]}
      data={ props.items }
      title="Items"
      options={ { paging: false, filtering: true } }
    />
  );
}
