import React from 'react';
import Header from '../../components/Header';
import { cn } from '../../lib/utils';
import { GridComponent, ColumnsDirective, ColumnDirective } from "@syncfusion/ej2-react-grids";
import { getAllUser } from '../../appwrite/Auth';
import { useLoaderData } from 'react-router-dom';
import { getALlTrips  } from '../../appwrite/Trips';

export const loader = async () => {
  try {
    const res = await getAllUser(10, 0);
    const totalTrips = await getALlTrips(4,0)
    
    return {
      users: res?.users ?? [],
      total: res?.total ?? 0,
      totalTrips : totalTrips.total
      

    };
  } catch (error) {
    console.error("Loader failed:", error);
    return { users: [], total: 0 };
  }
};

const AllUser = () => {
  const { users, total , totalTrips } = useLoaderData() as { users: any[]; total: number; totalTrips: number; };

  const gridData = users.map((user: any) => ({
    ...user,
    dateJoined: new Date(user.$createdAt).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric"
    }),
    itineraryCreated: user.itineraryCreated ?? 0,
    status: user.status ?? "user"
  }));
   


  return (
    // The background here is slightly off-white (slate-50) so the white cards "pop"
    <main className="wrapper space-y-8 bg-slate-50 min-h-screen p-8">
      
      <Header
        title="Manage Users"
        description="Monitor, manage and analyze your platform users"
      />

      {/* STATS CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Soft shadow and subtle border on cards */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Users</p>
          <h2 className="text-3xl font-semibold text-slate-900 mt-2">{total}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Users</p>
          <h2 className="text-3xl font-semibold text-emerald-600 mt-2">
            {users.filter(u => u.status === "user").length}
          </h2>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Trips</p>
          <h2 className="text-3xl font-semibold text-indigo-600 mt-2">
            {totalTrips}
          </h2>
        </div>
      </section>

      {/* TABLE CARD */}
      <section className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-base font-semibold text-slate-900">Directory</h3>
        </div>

        <GridComponent dataSource={gridData} gridLines="None">
          <ColumnsDirective>
            {/* USER COLUMN */}
            <ColumnDirective
              field="name"
              headerText="User"
              width="280"
              template={(userData: any) => (
                <div className="flex items-center gap-4 py-1">
                  <img
                    src={userData.imageUrl || `https://ui-avatars.com/api/?name=${userData.name}&background=f1f5f9&color=475569`}
                    alt="avatar"
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-900/5"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900">{userData.name}</span>
                    <span className="text-[13px] text-slate-500">{userData.email}</span>
                  </div>
                </div>
              )}
            />

            {/* DATE COLUMN */}
            <ColumnDirective field="dateJoined" headerText="Joined" width="160" />

            {/* TRIPS COLUMN */}
            <ColumnDirective
              field="itineraryCreated"
              headerText="Trips"
              width="140"
              template={(userData: any) => (
                <span className="text-slate-600 font-medium">{userData.itineraryCreated}</span>
              )}
            />

            {/* STATUS COLUMN */}
            <ColumnDirective
              field="status"
              headerText="Status"
              width="140"
              template={(userData: any) => {
                const isUser = userData.status === "user";
                return (
                  <div className="flex items-center">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors",
                      isUser 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                        : "bg-slate-100 text-slate-700 border border-slate-200/50"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isUser ? "bg-emerald-500" : "bg-slate-400"
                      )} />
                      <span className="capitalize">{userData.status}</span>
                    </span>
                  </div>
                );
              }}
            />
          </ColumnsDirective>
        </GridComponent>
      </section>
    </main>
  );
};

export default AllUser;
