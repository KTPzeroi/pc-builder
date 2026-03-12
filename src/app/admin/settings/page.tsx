"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader, Divider, Button, Input, Textarea, Tabs, Tab } from "@heroui/react";
import { IoSettingsOutline, IoSaveOutline, IoWarningOutline } from "react-icons/io5";

export default function SystemConfigPage() {
    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <IoSettingsOutline className="text-blue-500" />
                        System Config
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">ปรับแต่งเกณฑ์คะแนน (Baseline), น้ำหนักความสำคัญของสเปกคอม, หมวดหมู่ และกฎของบอร์ด</p>
                </div>
            </header>

            <section>
                <Tabs aria-label="Settings Options" color="primary" variant="underlined" classNames={{
                    tabList: "gap-8 border-b border-white/5 w-full",
                    tab: "h-12 font-bold px-0",
                    cursor: "bg-blue-500",
                    panel: "pt-8"
                }}>
                    <Tab key="baselines" title="PERFORMANCE BASELINES">
                        <Card className="bg-black/40 border border-white/10 shadow-xl max-w-4xl">
                            <CardHeader className="p-6 border-b border-white/5 flex flex-col items-start gap-1">
                                <h4 className="text-lg font-bold text-white uppercase tracking-widest text-sm italic">Metric Baselines</h4>
                                <p className="text-xs text-gray-400">กำหนดตัวเลข PassMark เริ่มต้นที่เป็นเกณฑ์คะแนน 100% สำหรับแต่ละสายงาน (อัปเดตตอนตกรุ่น)</p>
                            </CardHeader>
                            <CardBody className="p-8 flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        type="number"
                                        label="Gaming Baseline Score (G3D Mark)"
                                        placeholder="e.g. 25000"
                                        defaultValue="25000"
                                        description="คะแนนเฉลี่ยการ์ดจอที่จะวิ่งเกมยุคนี้ได้ลื่น"
                                        variant="faded"
                                    />
                                    <Input
                                        type="number"
                                        label="Working Baseline Score (CPU Mark)"
                                        placeholder="e.g. 15000"
                                        defaultValue="15000"
                                        description="คะแนนเฉลี่ย CPU สำหรับงาน Office/Coding"
                                        variant="faded"
                                    />
                                    <Input
                                        type="number"
                                        label="3D Render Baseline (Multi-thread + G3D)"
                                        placeholder="e.g. 40000"
                                        defaultValue="40000"
                                        description="คะแนนปนกันสำหรับสายขึ้นรูปโมเดล"
                                        variant="faded"
                                    />
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button color="primary" className="font-bold px-8 shadow-lg shadow-blue-500/20">
                                        <IoSaveOutline className="text-lg" />
                                        Save Baselines
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>

                    <Tab key="weights" title="WEIGHTING CONFIG">
                        <Card className="bg-black/40 border border-white/10 shadow-xl max-w-4xl">
                            <CardHeader className="p-6 border-b border-white/5 flex flex-col items-start gap-1">
                                <h4 className="text-lg font-bold text-white uppercase tracking-widest text-sm italic">Calculation Weights</h4>
                                <p className="text-xs text-gray-400">สัดส่วนเปอร์เซ็นต์ของฮาร์ดแวร์ในสมการประเมินความแรง</p>
                            </CardHeader>
                            <CardBody className="p-8 flex flex-col gap-8">
                                <div>
                                    <h5 className="font-bold text-blue-400 mb-4 flex items-center gap-2">Gaming Weight %</h5>
                                    <div className="flex gap-4">
                                        <Input type="number" label="GPU Weight" defaultValue="60" variant="bordered" className="max-w-[120px]" endContent={<span className="text-gray-500 text-sm">%</span>} />
                                        <Input type="number" label="CPU Weight" defaultValue="30" variant="bordered" className="max-w-[120px]" endContent={<span className="text-gray-500 text-sm">%</span>} />
                                        <Input type="number" label="RAM Weight" defaultValue="10" variant="bordered" className="max-w-[120px]" endContent={<span className="text-gray-500 text-sm">%</span>} />
                                    </div>
                                    <p className="text-xs text-danger mt-2 flex items-center gap-1"><IoWarningOutline /> Total must equal 100%</p>
                                </div>
                                <Divider className="bg-white/5" />
                                <div>
                                    <h5 className="font-bold text-green-400 mb-4 flex items-center gap-2">Working Weight %</h5>
                                    <div className="flex gap-4">
                                        <Input type="number" label="CPU Weight" defaultValue="60" variant="bordered" className="max-w-[120px]" endContent={<span className="text-gray-500 text-sm">%</span>} />
                                        <Input type="number" label="RAM Weight" defaultValue="20" variant="bordered" className="max-w-[120px]" endContent={<span className="text-gray-500 text-sm">%</span>} />
                                        <Input type="number" label="Storage Weight" defaultValue="20" variant="bordered" className="max-w-[120px]" endContent={<span className="text-gray-500 text-sm">%</span>} />
                                    </div>
                                    <p className="text-xs text-danger mt-2 flex items-center gap-1"><IoWarningOutline /> Total must equal 100%</p>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button color="primary" className="font-bold px-8 shadow-lg shadow-blue-500/20">
                                        <IoSaveOutline className="text-lg" />
                                        Save Weights
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>

                    <Tab key="categories" title="CATEGORIES & RULES">
                        <Card className="bg-black/40 border border-white/10 shadow-xl max-w-4xl">
                            <CardHeader className="p-6 border-b border-white/5 flex flex-col items-start gap-1">
                                <h4 className="text-lg font-bold text-white uppercase tracking-widest text-sm italic">Forum Policies</h4>
                                <p className="text-xs text-gray-400">กฎกติกาและหมวดหมู่สำหรับการตั้งกระทู้</p>
                            </CardHeader>
                            <CardBody className="p-8 flex flex-col gap-6">
                                <div>
                                    <h5 className="font-bold text-white mb-2">Forum Announcement & Rules</h5>
                                    <Textarea
                                        variant="bordered"
                                        placeholder="เขียนกฎหรือประกาศที่ต้องการโชว์บนบอร์ด..."
                                        defaultValue="1. กรุณาใช้คำสุภาพ&#10;2. ห้ามโพสต์สแปม&#10;3. เคารพความเห็นของผู้อื่น"
                                        minRows={4}
                                    />
                                </div>
                                <div>
                                    <h5 className="font-bold text-white mb-2">Category Labels (Comma separated)</h5>
                                    <Input
                                        variant="bordered"
                                        defaultValue="DISCUSSION, QUESTION, BUILD_ADVICE, NEWS_AND_RUMORS"
                                    />
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button color="primary" className="font-bold px-8 shadow-lg shadow-blue-500/20">
                                        <IoSaveOutline className="text-lg" />
                                        Apply Changes
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </section>
        </div>
    );
}
