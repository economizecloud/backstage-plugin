import { Header, HeaderLabel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import React, { useEffect, useState } from 'react';
import { economizeApiRef } from '../../api';

const HeaderBanner = () => {
  const api = useApi(economizeApiRef);
  const [orgName, setOrgName] = useState({
    name: '',
    OrgID: '',
    AccID: '',
  });

  const fetchOrgName = async () => {
    const orgname = await api.getOrgAndProject();
    setOrgName(orgname);
  };

  useEffect(() => {
    fetchOrgName();
  }, []);
  return (
    <Header title="Cloud Cost Portal" subtitle="powered by economize.cloud">
      {orgName.name && (
        <HeaderLabel value={orgName.name} label="Organization" />
      )}
      {orgName.OrgID && (
        <HeaderLabel value={orgName.OrgID} label="Organization ID" />
      )}
      {orgName.AccID && (
        <HeaderLabel value={orgName.AccID} label="Account ID" />
      )}
    </Header>
  );
};

export default HeaderBanner;
