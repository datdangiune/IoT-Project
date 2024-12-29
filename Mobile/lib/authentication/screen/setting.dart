import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get/get_core/src/get_main.dart';
import 'package:iot_20241/authentication/screen/card.dart';
import 'package:iot_20241/authentication/screen/login.dart';
import 'package:iot_20241/authentication/screen/widget/amount.dart';
import 'package:iot_20241/authentication/screen/widget/setting_tile.dart';
import 'package:iot_20241/authentication/screen/widget/sizes.dart';

class SettingScreen extends StatelessWidget {
  final String userId;
  const SettingScreen({Key? key, required this.userId}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Settings Screen"),
        centerTitle: true, // Căn giữa tiêu đề
        automaticallyImplyLeading: false, // Bỏ nút mũi tên quay lại
      ),
        body: SingleChildScrollView(
          child: Column(
            children: [

              //Body
              Padding(
                padding: const EdgeInsets.all(DSize.defaultspace),
                child: Column(
                  children: [
                    //Account Setting
                    const SizedBox(height: DSize.spaceBtwItem),
                    TSettingMenuTile(
                        icon: Icons.card_membership,
                        title: 'Quản lý thẻ',
                        subTitle: 'Quản lý danh sách thẻ của bạn',
                        onTap: () => Get.to(() => CardScreen(userId:userId))),
                    TSettingMenuTile(
                      icon: Icons.monetization_on_outlined,
                      title: 'Tài khoản',
                      subTitle: 'Xem thông tin tài khoản của bạn',
                      onTap: () => Get.to(() => AmountScreen(userId: userId)),),

                    //Logout Button
                    const SizedBox(height: DSize.spaceBtwSection),
                    SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: () async {
                            Get.to(() => const LoginPage());
                          }  ,
                          child: const Text('Logout'),
                        )),
                    const SizedBox(height: DSize.spaceBtwSection * 2.5),
                  ],
                ),
              ),
            ],
          ),
        ));
  }
}
